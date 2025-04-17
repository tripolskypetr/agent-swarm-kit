import { inject } from "../../core/di";
import { StateConnectionService } from "../connection/StateConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IStateData, StateName } from "../../../interfaces/State.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Interface extending StateConnectionService for type definition purposes.
 * Used to define TStateConnectionService by excluding internal keys, ensuring StatePublicService aligns with public-facing operations.
 * @interface IStateConnectionService
 */
interface IStateConnectionService extends StateConnectionService {}

/**
 * Type representing keys to exclude from IStateConnectionService (internal methods).
 * Used to filter out non-public methods like getStateRef and getSharedStateRef in TStateConnectionService.
 * @typedef {keyof { getStateRef: never; getSharedStateRef: never }} InternalKeys
 */
type InternalKeys = keyof {
  getStateRef: never;
  getSharedStateRef: never;
};

/**
 * Type representing the public interface of StatePublicService, derived from IStateConnectionService.
 * Excludes internal methods (e.g., getStateRef, getSharedStateRef) via InternalKeys, ensuring a consistent public API for client-specific state operations.
 * @typedef {Object} TStateConnectionService
 */
type TStateConnectionService = {
  [key in Exclude<keyof IStateConnectionService, InternalKeys>]: unknown;
};

/**
 * Service class for managing public client-specific state operations in the swarm system, with generic type support for state data.
 * Implements TStateConnectionService to provide a public API for state interactions, delegating to StateConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., managing client-specific state in EXECUTE_FN), PerfService (e.g., tracking sessionState per clientId), and DocService (e.g., documenting state schemas via stateName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like setting, clearing, retrieving, and disposing client-specific state.
 * Contrasts with SharedStatePublicService (system-wide state) and SharedStoragePublicService (persistent storage) by scoping state to individual clients via clientId.
 * @template T - The type of state data, extending IStateData from State.interface, defaulting to IStateData.
 */
export class StatePublicService<T extends IStateData = IStateData>
  implements TStateConnectionService
{
  /**
   * Logger service instance, injected via DI, for logging state operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.
   * @type {LoggerService}
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * State connection service instance, injected via DI, for underlying state operations.
   * Provides core functionality (e.g., setState, getState) called by public methods, supporting ClientAgent’s client-specific state needs.
   * @type {StateConnectionService}
   * @private
   */
  private readonly stateConnectionService = inject<StateConnectionService>(
    TYPES.stateConnectionService
  );

  /**
   * Sets the client-specific state using a provided dispatch function, updating the state identified by stateName for a given clientId.
   * Wraps StateConnectionService.setState with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., updating client state in EXECUTE_FN) and PerfService (e.g., tracking state changes in sessionState per client).
   * @param {(prevState: T) => Promise<T>} dispatchFn - The async function to dispatch the state change, taking the previous state and returning the updated state.
   * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
   * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking, scoping the state to a specific client.
   * @param {StateName} stateName - The name of the state, sourced from State.interface, used in DocService documentation.
   * @returns {Promise<T>} A promise resolving to the updated state of type T.
   */
  public setState = async (
    dispatchFn: (prevState: T) => Promise<T>,
    methodName: string,
    clientId: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`statePublicService setState`, {
        methodName,
        clientId,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.stateConnectionService.setState(dispatchFn);
      },
      {
        methodName,
        clientId,
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Resets the client-specific state to its initial value, identified by stateName for a given clientId.
   * Wraps StateConnectionService.clearState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., resetting client state in EXECUTE_FN) and PerfService (e.g., clearing sessionState for a specific client).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the state reset to a specific client.
   * @param {StateName} stateName - The name of the state to clear, used in DocService documentation.
   * @returns {Promise<T>} A promise resolving to the initial state of type T.
   */
  public clearState = async (
    methodName: string,
    clientId: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`statePublicService clearState`, {
        methodName,
        clientId,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.stateConnectionService.clearState();
      },
      {
        methodName,
        clientId,
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Retrieves the current client-specific state identified by stateName for a given clientId.
   * Wraps StateConnectionService.getState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., accessing client state in EXECUTE_FN) and PerfService (e.g., reading sessionState for a specific client).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the state retrieval to a specific client.
   * @param {StateName} stateName - The name of the state to retrieve, used in DocService documentation.
   * @returns {Promise<T>} A promise resolving to the current state of type T.
   */
  public getState = async (
    methodName: string,
    clientId: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`statePublicService getState`, {
        clientId,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.stateConnectionService.getState();
      },
      {
        methodName,
        clientId,
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Disposes of the client-specific state identified by stateName for a given clientId, cleaning up resources.
   * Wraps StateConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN) and PerfService’s dispose (e.g., clearing client-specific sessionState).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the state disposal to a specific client.
   * @param {StateName} stateName - The name of the state to dispose, used in DocService documentation.
   * @returns {Promise<void>} A promise resolving when the state is disposed.
   */
  public dispose = async (
    methodName: string,
    clientId: string,
    stateName: StateName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("statePublicService dispose", {
        methodName,
        clientId,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.stateConnectionService.dispose();
      },
      {
        methodName,
        clientId,
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        mcpName: "",
      }
    );
  };
}

/**
 * Default export of the StatePublicService class.
 * Provides the primary public interface for client-specific state operations in the swarm system, integrating with ClientAgent, PerfService, and DocService, with generic type support for state data.
 * @type {typeof StatePublicService}
 */
export default StatePublicService;
