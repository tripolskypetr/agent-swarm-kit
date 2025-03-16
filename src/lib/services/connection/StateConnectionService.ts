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
import SessionValidationService from "../validation/SessionValidationService";
import BusService from "../base/BusService";
import SharedStateConnectionService from "./SharedStateConnectionService";
import { PersistStateAdapter } from "../../../classes/Persist";

/**
 * Service class for managing state connections and operations in the swarm system.
 * Implements IState with a generic type T extending IStateData, providing an interface for state instance management, state manipulation, and lifecycle operations, scoped to clientId and stateName.
 * Handles both client-specific states and delegates to SharedStateConnectionService for shared states, tracked via a _sharedStateSet.
 * Integrates with ClientAgent (state in agent execution), StatePublicService (public state API), SharedStateConnectionService (shared state delegation), AgentConnectionService (state initialization), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientState instances by a composite key (clientId-stateName), and queued to serialize state updates, ensuring efficient reuse and thread-safe modifications.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StateSchemaService for state configuration, SessionValidationService for usage tracking, and SharedStateConnectionService for shared state handling.
 * @template T - The type of state data, extending IStateData, defining the structure of the state.
 * @implements {IState<T>}
 */
export class StateConnectionService<T extends IStateData = IStateData>
  implements IState<T>
{
  /**
   * Logger service instance, injected via DI, for logging state operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StatePublicService and PerfService logging patterns.
   * @type {LoggerService}
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Bus service instance, injected via DI, for emitting state-related events.
   * Passed to ClientState for event propagation (e.g., state updates), aligning with BusService’s event system in AgentConnectionService.
   * @type {BusService}
   * @private
   */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Method context service instance, injected via DI, for accessing execution context.
   * Used to retrieve clientId and stateName in method calls, integrating with MethodContextService’s scoping in StatePublicService.
   * @type {TMethodContextService}
   * @private
   */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * State schema service instance, injected via DI, for retrieving state configurations.
   * Provides configuration (e.g., persist, getState, setState) to ClientState in getStateRef, aligning with AgentMetaService’s schema management.
   * @type {StateSchemaService}
   * @private
   */
  private readonly stateSchemaService = inject<StateSchemaService>(
    TYPES.stateSchemaService
  );

  /**
   * Session validation service instance, injected via DI, for tracking state usage.
   * Used in getStateRef and dispose to manage state lifecycle, supporting SessionPublicService’s validation needs.
   * @type {SessionValidationService}
   * @private
   */
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Shared state connection service instance, injected via DI, for delegating shared state operations.
   * Used in getStateRef to retrieve shared states, integrating with SharedStateConnectionService’s global state management.
   * @type {SharedStateConnectionService}
   * @private
   */
  private readonly sharedStateConnectionService =
    inject<SharedStateConnectionService>(TYPES.sharedStateConnectionService);

  /**
   * Set of state names marked as shared, used to track delegation to SharedStateConnectionService.
   * Populated in getStateRef and checked in dispose to avoid disposing shared states.
   * @type {Set<StateName>}
   * @private
   */
  private _sharedStateSet = new Set<StateName>();

  /**
   * Retrieves or creates a memoized ClientState instance for a given client and state name.
   * Uses functools-kit’s memoize to cache instances by a composite key (clientId-stateName), ensuring efficient reuse across calls.
   * Configures client-specific states with schema data from StateSchemaService, applying persistence via PersistStateAdapter or defaults from GLOBAL_CONFIG, and serializes setState with queued for thread safety.
   * Delegates to SharedStateConnectionService for shared states (shared=true), tracking them in _sharedStateSet.
   * Supports ClientAgent (state in EXECUTE_FN), AgentConnectionService (state initialization), and StatePublicService (public API).
   * @param {string} clientId - The client ID, scoping the state to a specific client, tied to Session.interface and PerfService tracking.
   * @param {StateName} stateName - The name of the state, sourced from State.interface, used in StateSchemaService lookups.
   * @returns {ClientState} The memoized ClientState instance, either client-specific or shared via SharedStateConnectionService.
   */
  public getStateRef = memoize(
    ([clientId, stateName]) => `${clientId}-${stateName}`,
    (clientId: string, stateName: StateName) => {
      this.sessionValidationService.addStateUsage(clientId, stateName);
      const {
        persist = GLOBAL_CONFIG.CC_PERSIST_ENABLED_BY_DEFAULT,
        getState = persist
          ? PersistStateAdapter.getState
          : GLOBAL_CONFIG.CC_DEFAULT_STATE_GET,
        setState = persist
          ? PersistStateAdapter.setState
          : GLOBAL_CONFIG.CC_DEFAULT_STATE_SET,
        middlewares = [],
        callbacks,
        getDefaultState = () => ({}),
        shared = false,
      } = this.stateSchemaService.get(stateName);
      if (shared) {
        this._sharedStateSet.add(stateName);
        return this.sharedStateConnectionService.getStateRef(stateName);
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
        getDefaultState,
      });
    }
  );

  /**
   * Sets the state using a dispatch function that transforms the previous state.
   * Delegates to ClientState.setState after awaiting initialization, using context from MethodContextService to identify the state, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors StatePublicService’s setState, supporting ClientAgent’s state updates with serialized execution via queued in getStateRef.
   * @param {(prevState: T) => Promise<T>} dispatchFn - The function to dispatch the new state, taking the previous state and returning the updated state.
   * @returns {Promise<T>} A promise resolving to the new state after the update.
   */
  public setState = async (
    dispatchFn: (prevState: T) => Promise<T>
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateConnectionService setState`);
    const state = this.getStateRef(
      this.methodContextService.context.clientId,
      this.methodContextService.context.stateName
    );
    await state.waitForInit();
    return await state.setState(dispatchFn);
  };

  /**
   * Clears the state, resetting it to its initial value.
   * Delegates to ClientState.clearState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors StatePublicService’s clearState, supporting ClientAgent’s state reset with serialized execution.
   * @returns {Promise<T>} A promise resolving to the initial state after clearing.
   */
  public clearState = async (): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateConnectionService clearState`);
    const state = this.getStateRef(
      this.methodContextService.context.clientId,
      this.methodContextService.context.stateName
    );
    await state.waitForInit();
    return await state.clearState();
  };

  /**
   * Retrieves the current state.
   * Delegates to ClientState.getState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors StatePublicService’s getState, supporting ClientAgent’s state access.
   * @returns {Promise<T>} A promise resolving to the current state.
   */
  public getState = async (): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateConnectionService getState`);
    const state = this.getStateRef(
      this.methodContextService.context.clientId,
      this.methodContextService.context.stateName
    );
    await state.waitForInit();
    return await state.getState();
  };

  /**
   * Disposes of the state connection, cleaning up resources and clearing the memoized instance for client-specific states.
   * Checks if the state exists in the memoization cache and is not shared (via _sharedStateSet) before calling ClientState.dispose, then clears the cache and updates SessionValidationService.
   * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with StatePublicService’s dispose and PerfService’s cleanup.
   * Shared states are not disposed here, as they are managed by SharedStateConnectionService.
   * @returns {Promise<void>} A promise resolving when the state connection is disposed (for client-specific states).
   */
  public dispose = async (): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateConnectionService dispose`);
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.stateName}`;
    if (!this.getStateRef.has(key)) {
      return;
    }
    if (
      !this._sharedStateSet.has(this.methodContextService.context.stateName)
    ) {
      const state = this.getStateRef(
        this.methodContextService.context.clientId,
        this.methodContextService.context.stateName
      );
      await state.waitForInit();
      await state.dispose();
    }
    this.getStateRef.clear(key);
    this.sessionValidationService.removeStateUsage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.stateName
    );
  };
}

/**
 * Default export of the StateConnectionService class.
 * Provides the primary service for managing state connections in the swarm system, integrating with ClientAgent, StatePublicService, SharedStateConnectionService, AgentConnectionService, and PerfService, with memoized and queued state management.
 * @type {typeof StateConnectionService}
 */
export default StateConnectionService;
