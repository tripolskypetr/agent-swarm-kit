import { inject } from "../../core/di";
import { SharedStateConnectionService } from "../connection/SharedStateConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IStateData, StateName } from "../../../interfaces/State.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Interface extending SharedStateConnectionService for type definition purposes.
 * Used to define TSharedStateConnectionService by excluding internal keys, ensuring SharedStatePublicService aligns with public-facing operations.
 * @interface ISharedStateConnectionService
 */
interface ISharedStateConnectionService extends SharedStateConnectionService {}

/**
 * Type representing keys to exclude from ISharedStateConnectionService (internal methods).
 * Used to filter out non-public methods like getStateRef and getSharedStateRef in TSharedStateConnectionService.
 * @typedef {keyof { getStateRef: never; getSharedStateRef: never }} InternalKeys
 */
type InternalKeys = keyof {
  getStateRef: never;
  getSharedStateRef: never;
};

/**
 * Type representing the public interface of SharedStatePublicService, derived from ISharedStateConnectionService.
 * Excludes internal methods (e.g., getStateRef, getSharedStateRef) via InternalKeys, ensuring a consistent public API for shared state operations.
 * @typedef {Object} TSharedStateConnectionService
 */
type TSharedStateConnectionService = {
  [key in Exclude<keyof ISharedStateConnectionService, InternalKeys>]: unknown;
};

/**
 * Service class for managing public shared state operations in the swarm system, with generic type support for state data.
 * Implements TSharedStateConnectionService to provide a public API for shared state interactions, delegating to SharedStateConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with PerfService (e.g., sessionState tracking in computeClientState), ClientAgent (e.g., state management in EXECUTE_FN), and DocService (e.g., documenting state schemas via stateName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like setting, clearing, and retrieving shared state across the system.
 * @template T - The type of state data, extending IStateData from State.interface, defaulting to IStateData.
 */
export class SharedStatePublicService<T extends IStateData = IStateData>
  implements TSharedStateConnectionService
{
  /**
   * Logger service instance, injected via DI, for logging shared state operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.
   * @type {LoggerService}
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Shared state connection service instance, injected via DI, for underlying state operations.
   * Provides core functionality (e.g., setState, getState) called by public methods, supporting ClientAgent’s state management needs.
   * @type {SharedStateConnectionService}
   * @private
   */
  private readonly sharedStateConnectionService =
    inject<SharedStateConnectionService>(TYPES.sharedStateConnectionService);

  /**
   * Sets the shared state using a provided dispatch function, updating the state identified by stateName.
   * Wraps SharedStateConnectionService.setState with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., updating state in EXECUTE_FN) and PerfService (e.g., tracking state changes in sessionState).
   * @param {(prevState: T) => Promise<T>} dispatchFn - The async function to dispatch the state change, taking the previous state and returning the updated state.
   * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
   * @param {StateName} stateName - The name of the shared state, sourced from State.interface, used in DocService documentation.
   * @returns {Promise<T>} A promise resolving to the updated state of type T.
   */
  public setState = async (
    dispatchFn: (prevState: T) => Promise<T>,
    methodName: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStatePublicService setState`, {
        methodName,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStateConnectionService.setState(dispatchFn);
      },
      {
        methodName,
        clientId: "",
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Resets the shared state to its initial value, identified by stateName.
   * Wraps SharedStateConnectionService.clearState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., resetting state in EXECUTE_FN) and PerfService (e.g., clearing sessionState for performance resets).
   * @param {string} methodName - The method name for context and logging.
   * @param {StateName} stateName - The name of the shared state to clear, used in DocService documentation.
   * @returns {Promise<T>} A promise resolving to the initial state of type T.
   */
  public clearState = async (
    methodName: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStatePublicService clearState`, {
        methodName,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStateConnectionService.clearState();
      },
      {
        methodName,
        clientId: "",
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Retrieves the current shared state identified by stateName.
   * Wraps SharedStateConnectionService.getState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., accessing state in EXECUTE_FN) and PerfService (e.g., reading sessionState for metrics).
   * @param {string} methodName - The method name for context and logging.
   * @param {StateName} stateName - The name of the shared state to retrieve, used in DocService documentation.
   * @returns {Promise<T>} A promise resolving to the current state of type T.
   */
  public getState = async (
    methodName: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStatePublicService getState`, {
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStateConnectionService.getState();
      },
      {
        methodName,
        clientId: "",
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };
}

/**
 * Default export of the SharedStatePublicService class.
 * Provides the primary public interface for shared state operations in the swarm system, integrating with ClientAgent, PerfService, and DocService, with generic type support for state data.
 * @type {typeof SharedStatePublicService}
 */
export default SharedStatePublicService;
