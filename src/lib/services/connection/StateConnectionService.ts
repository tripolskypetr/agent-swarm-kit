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
import BusService from "../base/BusService";

/**
 * Service for managing state connections.
 * @template T - The type of state data.
 * @implements {IState<T>}
 */
export class StateConnectionService<T extends IStateData = IStateData>
  implements IState<T>
{
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
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
   * Memoized function to get a shared state reference.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The state name.
   * @returns {ClientState} The client state.
   */
  public getSharedStateRef = memoize(
    ([, stateName]) => `${stateName}`,
    (clientId: string, stateName: StateName) => {
      this.sessionValidationService.addStateUsage(clientId, stateName);
      const {
        getState,
        setState,
        middlewares = [],
        shared,
        callbacks,
      } = this.stateSchemaService.get(stateName);
      if (!shared) {
        throw new Error(`agent-swarm state not shared stateName=${stateName}`);
      }
      return new ClientState({
        clientId,
        stateName,
        logger: this.loggerService,
        bus: this.busService,
        setState: setState
          ? (queued(
              async (...args) => await setState(...args)
            ) as typeof setState)
          : setState,
        getState,
        middlewares,
        callbacks,
      });
    }
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
        shared = false,
      } = this.stateSchemaService.get(stateName);
      if (shared) {
        return this.getSharedStateRef(clientId, stateName);
      }
      return new ClientState({
        clientId,
        stateName,
        logger: this.loggerService,
        bus: this.busService,
        setState: setState
          ? (queued(
              async (...args) => await setState(...args)
            ) as typeof setState)
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
    this.loggerService.log(`stateConnectionService setState`);
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
    this.loggerService.log(`stateConnectionService getState`);
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
    this.loggerService.log(`stateConnectionService dispose`);
    const key = `${this.contextService.context.clientId}-${this.contextService.context.stateName}`;
    if (!this.getStateRef.has(key)) {
      return;
    }
    if (!this.getSharedStateRef.has(this.contextService.context.stateName)) {
      const state = this.getStateRef(
        this.contextService.context.clientId,
        this.contextService.context.stateName
      );
      await state.waitForInit();
      await state.dispose();
    }
    this.getStateRef.clear(key);
    this.sessionValidationService.removeStateUsage(
      this.contextService.context.clientId,
      this.contextService.context.stateName
    );
  };
}

export default StateConnectionService;
