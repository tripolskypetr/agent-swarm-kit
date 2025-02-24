import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { memoize, queued } from "functools-kit";
import { TContextService } from "../base/ContextService";
import ClientState from "../../../client/ClientState";
import StateSchemaService from "../schema/StateSchemaService";
import {
  IState,
  IStateData,
  StateName,
} from "../../../interfaces/State.interface";
import SessionValidationService from "../validation/SessionValidationService";

/**
 * Service for managing state connections.
 * @template T - The type of state data.
 * @implements {IState<T>}
 */
export class StateConnectionService<T extends IStateData = IStateData>
  implements IState<T>
{
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );

  private readonly stateSchemaService = inject<StateSchemaService>(
    TYPES.stateSchemaService
  );

  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Memoized function to get a state reference.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The state name.
   * @returns {ClientState} The client state.
   */
  public getStateRef = memoize(
    ([clientId, stateName]) => `${clientId}-${stateName}`,
    (clientId: string, stateName: StateName) => {
      this.sessionValidationService.addStateUsage(clientId, stateName);
      const {
        getState,
        setState,
        middlewares = [],
        callbacks,
      } = this.stateSchemaService.get(stateName);
      return new ClientState({
        clientId,
        stateName,
        logger: this.loggerService,
        setState: setState
          ? queued(
              async (...args) => await setState(...args)
            ) as typeof setState
          : setState,
        getState,
        middlewares,
        callbacks,
      });
    }
  );

  /**
   * Sets the state.
   * @param {function(T): Promise<T>} dispatchFn - The function to dispatch the new state.
   * @returns {Promise<T>} The new state.
   */
  public setState = async (
    dispatchFn: (prevState: T) => Promise<T>
  ): Promise<T> => {
    this.loggerService.log(`stateConnectionService setState`, {
      context: this.contextService.context,
    });
    const state = this.getStateRef(
      this.contextService.context.clientId,
      this.contextService.context.stateName
    );
    await state.waitForInit();
    return await state.setState(dispatchFn);
  };

  /**
   * Gets the state.
   * @returns {Promise<T>} The current state.
   */
  public getState = async (): Promise<T> => {
    this.loggerService.log(`stateConnectionService getState`, {
      context: this.contextService.context,
    });
    const state = this.getStateRef(
      this.contextService.context.clientId,
      this.contextService.context.stateName
    );
    await state.waitForInit();
    return await state.getState();
  };

  /**
   * Disposes the state connection.
   * @returns {Promise<void>}
   */
  public dispose = async (): Promise<void> => {
    this.loggerService.log(`stateConnectionService dispose`, {
      context: this.contextService.context,
    });
    const key = `${this.contextService.context.clientId}-${this.contextService.context.stateName}`;
    if (!this.getStateRef.has(key)) {
      return;
    }
    const state = this.getStateRef(
      this.contextService.context.clientId,
      this.contextService.context.stateName
    );
    await state.waitForInit();
    await state.dispose();
    this.getStateRef.clear(key);
    this.sessionValidationService.removeStateUsage(
      this.contextService.context.clientId,
      this.contextService.context.stateName
    );
  };
}

export default StateConnectionService;
