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
 *  */
interface IPolicyConnectionService extends PolicyConnectionService {}

/**
 * Type representing keys to exclude from IPolicyConnectionService (internal methods).
 * Used to filter out non-public methods like getPolicy in TPolicyConnectionService.
 *  */
type InternalKeys = keyof {
  getPolicy: never;
};

/**
 * Type representing the public interface of PolicyPublicService, derived from IPolicyConnectionService.
 * Excludes internal methods (e.g., getPolicy) via InternalKeys, ensuring a consistent public API for policy operations.
 *  */
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
   *    * */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Policy connection service instance, injected via DI, for underlying policy operations.
   * Provides core functionality (e.g., hasBan, validateInput) called by public methods, aligning with PerfService’s policy enforcement.
   *    * */
  private readonly policyConnectionService = inject<PolicyConnectionService>(
    TYPES.policyConnectionService
  );

  /**
   * Checks if a client is banned from a specific swarm under a given policy.
   * Wraps PolicyConnectionService.hasBan with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in PerfService (e.g., policyBans in computeClientState) and ClientAgent (e.g., pre-execution ban checks in EXECUTE_FN).
   *    *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Retrieves the ban message for a client in a specific swarm under a given policy.
   * Wraps PolicyConnectionService.getBanMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., displaying ban reasons in EXECUTE_FN) and PerfService (e.g., policyBans logging).
   *    *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Validates incoming data against a specific policy for a client in a swarm.
   * Wraps PolicyConnectionService.validateInput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., input validation in EXECUTE_FN) and PerfService (e.g., policy enforcement in computeClientState).
   *    *    *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Validates outgoing data against a specific policy for a client in a swarm.
   * Wraps PolicyConnectionService.validateOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., output validation in EXECUTE_FN) and DocService (e.g., documenting policy-compliant outputs).
   *    *    *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Bans a client from a specific swarm under a given policy.
   * Wraps PolicyConnectionService.banClient with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in PerfService (e.g., enforcing policyBans in computeClientState) and ClientAgent (e.g., restricting access).
   *    *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Unbans a client from a specific swarm under a given policy.
   * Wraps PolicyConnectionService.unbanClient with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports PerfService (e.g., reversing policyBans) and ClientAgent (e.g., restoring access).
   *    *    *    *    *    */
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
        computeName: "",
      }
    );
  };
}

/**
 * Default export of the PolicyPublicService class.
 * Provides the primary public interface for policy operations in the swarm system, integrating with PerfService, ClientAgent, DocService, and SwarmMetaService.
 *  */
export default PolicyPublicService;
