import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { memoize, queued } from "functools-kit";
import { TMethodContextService } from "../context/MethodContextService";
import ClientState from "../../../client/ClientState";
import StateSchemaService from "../schema/StateSchemaService";
import { GLOBAL_CONFIG } from "../../../config/params";
import {
  IState,
  IStateData,
  StateName,
} from "../../../interfaces/State.interface";
import BusService from "../base/BusService";

/**
 * Service for managing shared state connections.
 * @template T - The type of state data.
 * @implements {IState<T>}
 */
export class SharedStateConnectionService<T extends IStateData = IStateData>
  implements IState<T>
{
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  private readonly stateSchemaService = inject<StateSchemaService>(
    TYPES.stateSchemaService
  );

  /**
   * Memoized function to get a shared state reference.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The state name.
   * @returns {ClientState} The client state.
   */
  public getStateRef = memoize(
    ([stateName]) => `${stateName}`,
    (stateName: StateName) => {
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
        clientId: "*",
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
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStateConnectionService setState`);
    const state = this.getStateRef(
      this.methodContextService.context.stateName
    );
    await state.waitForInit();
    return await state.setState(dispatchFn);
  };

  /**
   * Gets the state.
   * @returns {Promise<T>} The current state.
   */
  public getState = async (): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStateConnectionService getState`);
    const state = this.getStateRef(
      this.methodContextService.context.stateName
    );
    await state.waitForInit();
    return await state.getState();
  };
}

export default SharedStateConnectionService;
