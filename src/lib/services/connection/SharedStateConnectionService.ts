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
import { PersistStateAdapter } from "../../../classes/Persist";

/**
 * Service class for managing shared state connections and operations in the swarm system.
 * Implements IState with a generic type T extending IStateData, providing an interface for shared state instance management, state manipulation, and state access, scoped to stateName across all clients (using a fixed clientId of "shared").
 * Integrates with ClientAgent (shared state in agent execution), StatePublicService (client-specific state counterpart), SharedStatePublicService (public shared state API), AgentConnectionService (state initialization), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientState instances by stateName, and queued to serialize state updates, ensuring efficient reuse and thread-safe modifications.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StateSchemaService for state configuration, applying persistence via PersistStateAdapter or defaults from GLOBAL_CONFIG.
 * @template T - The type of state data, extending IStateData, defining the structure of the shared state.
 * @implements {IState<T>}
*/
export class SharedStateConnectionService<T extends IStateData = IStateData>
  implements IState<T>
{
  /**
   * Logger service instance, injected via DI, for logging shared state operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SharedStatePublicService and PerfService logging patterns.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Bus service instance, injected via DI, for emitting state-related events.
   * Passed to ClientState for event propagation (e.g., state updates), aligning with BusService’s event system in AgentConnectionService.
   * @private
   */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Method context service instance, injected via DI, for accessing execution context.
   * Used to retrieve stateName in method calls, integrating with MethodContextService’s scoping in SharedStatePublicService.
   * @private
   */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * State schema service instance, injected via DI, for retrieving state configurations.
   * Provides configuration (e.g., persist, getState, setState) to ClientState in getStateRef, aligning with AgentMetaService’s schema management.
   * @private
   */
  private readonly stateSchemaService = inject<StateSchemaService>(
    TYPES.stateSchemaService
  );

  /**
   * Retrieves or creates a memoized ClientState instance for a given shared state name.
   * Uses functools-kit’s memoize to cache instances by stateName, ensuring a single shared instance across all clients (fixed clientId: "shared").
   * Configures the state with schema data from StateSchemaService, applying persistence via PersistStateAdapter or defaults from GLOBAL_CONFIG, and enforces shared=true via an error check.
   * Serializes setState operations with queued if setState is provided, ensuring thread-safe updates.
   * Supports ClientAgent (shared state in EXECUTE_FN), AgentConnectionService (state initialization), and SharedStatePublicService (public API).
   * @throws {Error} If the state is not marked as shared in the schema.
   */
  public getStateRef = memoize(
    ([stateName]) => `${stateName}`,
    (stateName: StateName) => {
      const {
        persist = GLOBAL_CONFIG.CC_PERSIST_ENABLED_BY_DEFAULT,
        getState = persist
          ? PersistStateAdapter.getState
          : GLOBAL_CONFIG.CC_DEFAULT_STATE_GET,
        setState = persist
          ? PersistStateAdapter.setState
          : GLOBAL_CONFIG.CC_DEFAULT_STATE_SET,
        middlewares = [],
        shared,
        getDefaultState = () => ({}),
        callbacks,
      } = this.stateSchemaService.get(stateName);
      if (!shared) {
        throw new Error(`agent-swarm state not shared stateName=${stateName}`);
      }
      return new ClientState({
        clientId: "shared",
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
        getDefaultState,
      });
    }
  );

  /**
   * Sets the shared state using a dispatch function that transforms the previous state.
   * Delegates to ClientState.setState after awaiting initialization, using context from MethodContextService to identify the state, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SharedStatePublicService’s setState, supporting ClientAgent’s state updates with serialized execution via queued in getStateRef.
   */
  public setState = async (
    dispatchFn: (prevState: T) => Promise<T>
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStateConnectionService setState`);
    const state = this.getStateRef(this.methodContextService.context.stateName);
    await state.waitForInit();
    return await state.setState(dispatchFn);
  };

  /**
   * Clears the shared state, resetting it to its initial value.
   * Delegates to ClientState.clearState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SharedStatePublicService’s clearState, supporting ClientAgent’s state reset with serialized execution.
   */
  public clearState = async (): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStateConnectionService clearState`);
    const state = this.getStateRef(this.methodContextService.context.stateName);
    await state.waitForInit();
    return await state.clearState();
  };

  /**
   * Retrieves the current shared state.
   * Delegates to ClientState.getState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SharedStatePublicService’s getState, supporting ClientAgent’s state access.
   */
  public getState = async (): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStateConnectionService getState`);
    const state = this.getStateRef(this.methodContextService.context.stateName);
    await state.waitForInit();
    return await state.getState();
  };
}

/**
 * Default export of the SharedStateConnectionService class.
 * Provides the primary service for managing shared state connections in the swarm system, integrating with ClientAgent, StatePublicService, SharedStatePublicService, AgentConnectionService, and PerfService, with memoized and queued state management.
*/
export default SharedStateConnectionService;
