import { inject } from "../../core/di";
import { PolicyConnectionService } from "../connection/PolicyConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { GLOBAL_CONFIG } from "../../../config/params";
import { PolicyName } from "../../../interfaces/Policy.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";

/**
 * Interface extending PolicyConnectionService for type definition purposes.
 * Used to define TPolicyConnectionService by excluding internal keys, ensuring PolicyPublicService aligns with public-facing operations.
 * @interface IPolicyConnectionService
 */
interface IPolicyConnectionService extends PolicyConnectionService {}

/**
 * Type representing keys to exclude from IPolicyConnectionService (internal methods).
 * Used to filter out non-public methods like getPolicy in TPolicyConnectionService.
 * @typedef {keyof { getPolicy: never }} InternalKeys
 */
type InternalKeys = keyof {
  getPolicy: never;
};

/**
 * Type representing the public interface of PolicyPublicService, derived from IPolicyConnectionService.
 * Excludes internal methods (e.g., getPolicy) via InternalKeys, ensuring a consistent public API for policy operations.
 * @typedef {Object} TPolicyConnectionService
 */
type TPolicyConnectionService = {
  [key in Exclude<keyof IPolicyConnectionService, InternalKeys>]: unknown;
};

/**
 * Service class for managing public policy operations in the swarm system.
 * Implements TPolicyConnectionService to provide a public API for policy-related interactions, delegating to PolicyConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with PerfService (e.g., policyBans in computeClientState), ClientAgent (e.g., input/output validation in EXECUTE_FN), DocService (e.g., policy documentation via policyName), and SwarmMetaService (e.g., swarm context via swarmName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like ban checking, validation, and client ban management.
 */
export class PolicyPublicService implements TPolicyConnectionService {
  /**
   * Logger service instance, injected via DI, for logging policy operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentPublicService and DocService logging patterns.
   * @type {LoggerService}
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Policy connection service instance, injected via DI, for underlying policy operations.
   * Provides core functionality (e.g., hasBan, validateInput) called by public methods, aligning with PerfService’s policy enforcement.
   * @type {PolicyConnectionService}
   * @private
   */
  private readonly policyConnectionService = inject<PolicyConnectionService>(
    TYPES.policyConnectionService
  );

  /**
   * Checks if a client is banned from a specific swarm under a given policy.
   * Wraps PolicyConnectionService.hasBan with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in PerfService (e.g., policyBans in computeClientState) and ClientAgent (e.g., pre-execution ban checks in EXECUTE_FN).
   * @param {SwarmName} swarmName - The name of the swarm, sourced from Swarm.interface, tying to SwarmMetaService.
   * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
   * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking.
   * @param {PolicyName} policyName - The name of the policy, sourced from Policy.interface, used in DocService docs.
   * @returns {Promise<boolean>} A promise resolving to true if the client is banned, false otherwise.
   */
  public hasBan = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService hasBan", {
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.hasBan(clientId, swarmName);
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Retrieves the ban message for a client in a specific swarm under a given policy.
   * Wraps PolicyConnectionService.getBanMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., displaying ban reasons in EXECUTE_FN) and PerfService (e.g., policyBans logging).
   * @param {SwarmName} swarmName - The name of the swarm, tying to SwarmMetaService context.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {PolicyName} policyName - The policy name for identification and documentation.
   * @returns {Promise<string>} A promise resolving to the ban message string.
   */
  public getBanMessage = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService getBanMessage", {
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.getBanMessage(
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Validates incoming data against a specific policy for a client in a swarm.
   * Wraps PolicyConnectionService.validateInput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., input validation in EXECUTE_FN) and PerfService (e.g., policy enforcement in computeClientState).
   * @param {string} incoming - The incoming data to validate (e.g., user input).
   * @param {SwarmName} swarmName - The name of the swarm for context.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {PolicyName} policyName - The policy name for identification.
   * @returns {Promise<boolean>} A promise resolving to true if the input is valid, false otherwise.
   */
  public validateInput = async (
    incoming: string,
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService validateInput", {
        incoming,
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.validateInput(
          incoming,
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Validates outgoing data against a specific policy for a client in a swarm.
   * Wraps PolicyConnectionService.validateOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., output validation in EXECUTE_FN) and DocService (e.g., documenting policy-compliant outputs).
   * @param {string} outgoing - The outgoing data to validate (e.g., agent response).
   * @param {SwarmName} swarmName - The name of the swarm for context.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {PolicyName} policyName - The policy name for identification.
   * @returns {Promise<boolean>} A promise resolving to true if the output is valid, false otherwise.
   */
  public validateOutput = async (
    outgoing: string,
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService validateOutput", {
        outgoing,
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.validateOutput(
          outgoing,
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Bans a client from a specific swarm under a given policy.
   * Wraps PolicyConnectionService.banClient with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in PerfService (e.g., enforcing policyBans in computeClientState) and ClientAgent (e.g., restricting access).
   * @param {SwarmName} swarmName - The name of the swarm to ban the client from.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID to ban.
   * @param {PolicyName} policyName - The policy name enforcing the ban.
   * @returns {Promise<void>} A promise resolving when the client is banned.
   */
  public banClient = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService banClient", {
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.banClient(
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Unbans a client from a specific swarm under a given policy.
   * Wraps PolicyConnectionService.unbanClient with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports PerfService (e.g., reversing policyBans) and ClientAgent (e.g., restoring access).
   * @param {SwarmName} swarmName - The name of the swarm to unban the client from.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID to unban.
   * @param {PolicyName} policyName - The policy name lifting the ban.
   * @returns {Promise<void>} A promise resolving when the client is unbanned.
   */
  public unbanClient = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService unbanClient", {
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.unbanClient(
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };
}

/**
 * Default export of the PolicyPublicService class.
 * Provides the primary public interface for policy operations in the swarm system, integrating with PerfService, ClientAgent, DocService, and SwarmMetaService.
 * @type {typeof PolicyPublicService}
 */
export default PolicyPublicService;
