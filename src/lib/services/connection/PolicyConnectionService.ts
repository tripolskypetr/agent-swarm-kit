import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import IPolicy, { PolicyName } from "../../../interfaces/Policy.interface";
import { memoize } from "functools-kit";
import ClientPolicy from "../../../client/ClientPolicy";
import { TMethodContextService } from "../context/MethodContextService";
import { GLOBAL_CONFIG } from "../../../config/params";
import BusService from "../base/BusService";
import PolicySchemaService from "../schema/PolicySchemaService";
import { SessionId } from "../../../interfaces/Session.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { PersistPolicyAdapter } from "../../../classes/Persist";

/**
 * Service class for managing policy connections and operations in the swarm system.
 * Implements IPolicy to provide an interface for policy instance management, ban status checks, input/output validation, and ban management, scoped to policyName, clientId, and swarmName.
 * Integrates with ClientAgent (policy enforcement in EXECUTE_FN), SessionPublicService (session-level policy enforcement), PolicyPublicService (public policy API), SwarmPublicService (swarm context), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientPolicy instances by policyName, ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with PolicySchemaService for policy configuration and BusService for event emission.
 * @implements {IPolicy}
 */
export class PolicyConnectionService implements IPolicy {
  /**
   * Logger service instance, injected via DI, for logging policy operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with PolicyPublicService and PerfService logging patterns.
   * @type {LoggerService}
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Bus service instance, injected via DI, for emitting policy-related events.
   * Passed to ClientPolicy for event propagation (e.g., ban updates), aligning with BusService’s event system in SessionPublicService.
   * @type {BusService}
   * @private
   */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Method context service instance, injected via DI, for accessing execution context.
   * Used to retrieve policyName in method calls, integrating with MethodContextService’s scoping in PolicyPublicService.
   * @type {TMethodContextService}
   * @private
   */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * Policy schema service instance, injected via DI, for retrieving policy configurations.
   * Provides policy details (e.g., autoBan, schema) in getPolicy, aligning with DocService’s policy documentation.
   * @type {PolicySchemaService}
   * @private
   */
  private readonly policySchemaService = inject<PolicySchemaService>(
    TYPES.policySchemaService
  );

  /**
   * Retrieves or creates a memoized ClientPolicy instance for a given policy name.
   * Uses functools-kit’s memoize to cache instances by policyName, ensuring efficient reuse across calls.
   * Configures the policy with schema data from PolicySchemaService, defaulting autoBan to GLOBAL_CONFIG.CC_AUTOBAN_ENABLED_BY_DEFAULT if not specified.
   * Supports ClientAgent (policy enforcement), SessionPublicService (session policies), and PolicyPublicService (public API).
   * @param {PolicyName} policyName - The name of the policy, sourced from Policy.interface, used in PolicySchemaService lookups.
   * @returns {ClientPolicy} The memoized ClientPolicy instance configured for the policy.
   */
  public getPolicy = memoize(
    ([policyName]) => `${policyName}`,
    (policyName: PolicyName) => {
      const {
        autoBan = GLOBAL_CONFIG.CC_AUTOBAN_ENABLED_BY_DEFAULT,
        banMessage = GLOBAL_CONFIG.CC_BANHAMMER_PLACEHOLDER,
        persist = GLOBAL_CONFIG.CC_PERSIST_ENABLED_BY_DEFAULT,
        getBannedClients = persist
          ? PersistPolicyAdapter.getBannedClients
          : GLOBAL_CONFIG.CC_DEFAULT_POLICY_GET,
        setBannedClients = persist
          ? PersistPolicyAdapter.setBannedClients
          : GLOBAL_CONFIG.CC_DEFAULT_POLICY_SET,
        ...schema
      } = this.policySchemaService.get(policyName);
      return new ClientPolicy({
        policyName,
        bus: this.busService,
        logger: this.loggerService,
        autoBan,getBannedClients,
        setBannedClients,
        banMessage,
        ...schema,
      });
    }
  );

  /**
   * Checks if a client has a ban flag in a specific swarm.
   * Delegates to ClientPolicy.hasBan, using context from MethodContextService to identify the policy, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors PolicyPublicService’s hasBan, supporting ClientAgent’s execution restrictions and SessionPublicService’s policy enforcement.
   * @param {SessionId} clientId - The ID of the client (session), scoping the check to a specific client, tied to Session.interface.
   * @param {SwarmName} swarmName - The name of the swarm, scoping the check to a specific swarm, sourced from Swarm.interface.
   * @returns {Promise<boolean>} A promise resolving to true if the client is banned in the swarm, false otherwise.
   */
  public hasBan = async (
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService hasBan`, {
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).hasBan(clientId, swarmName);
  };

  /**
   * Retrieves the ban message for a client in a specific swarm.
   * Delegates to ClientPolicy.getBanMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors PolicyPublicService’s getBanMessage, supporting ClientAgent’s ban feedback and SessionPublicService’s policy reporting.
   * @param {SessionId} clientId - The ID of the client (session), scoping the retrieval to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, scoping the retrieval to a specific swarm.
   * @returns {Promise<string>} A promise resolving to the ban message for the client in the swarm.
   */
  public getBanMessage = async (
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService getBanMessage`, {
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).getBanMessage(clientId, swarmName);
  };

  /**
   * Validates incoming input for a client in a specific swarm against the policy.
   * Delegates to ClientPolicy.validateInput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors PolicyPublicService’s validateInput, supporting ClientAgent’s input validation (e.g., in EXECUTE_FN) and SessionPublicService’s policy checks.
   * @param {string} incoming - The incoming input to validate.
   * @param {SessionId} clientId - The ID of the client (session), scoping the validation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, scoping the validation to a specific swarm.
   * @returns {Promise<boolean>} A promise resolving to true if the input is valid, false otherwise.
   */
  public validateInput = async (
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService validateInput`, {
        incoming,
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).validateInput(incoming, clientId, swarmName);
  };

  /**
   * Validates outgoing output for a client in a specific swarm against the policy.
   * Delegates to ClientPolicy.validateOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors PolicyPublicService’s validateOutput, supporting ClientAgent’s output validation (e.g., in EXECUTE_FN) and SessionPublicService’s policy checks.
   * @param {string} outgoing - The outgoing output to validate.
   * @param {SessionId} clientId - The ID of the client (session), scoping the validation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, scoping the validation to a specific swarm.
   * @returns {Promise<boolean>} A promise resolving to true if the output is valid, false otherwise.
   */
  public validateOutput = async (
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService validateOutput`, {
        outgoing,
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).validateOutput(outgoing, clientId, swarmName);
  };

  /**
   * Bans a client from a specific swarm based on the policy.
   * Delegates to ClientPolicy.banClient, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors PolicyPublicService’s banClient, supporting ClientAgent’s ban enforcement and SessionPublicService’s policy actions.
   * @param {SessionId} clientId - The ID of the client (session) to ban.
   * @param {SwarmName} swarmName - The name of the swarm from which to ban the client.
   * @returns {Promise<void>} A promise resolving when the client is banned.
   */
  public banClient = async (
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService banClient`, {
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).banClient(clientId, swarmName);
  };

  /**
   * Unbans a client from a specific swarm based on the policy.
   * Delegates to ClientPolicy.unbanClient, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors PolicyPublicService’s unbanClient, supporting ClientAgent’s ban reversal and SessionPublicService’s policy actions.
   * @param {SessionId} clientId - The ID of the client (session) to unban.
   * @param {SwarmName} swarmName - The name of the swarm from which to unban the client.
   * @returns {Promise<void>} A promise resolving when the client is unbanned.
   */
  public unbanClient = async (
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService unbanClient`, {
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).unbanClient(clientId, swarmName);
  };
}

/**
 * Default export of the PolicyConnectionService class.
 * Provides the primary service for managing policy connections in the swarm system, integrating with ClientAgent, SessionPublicService, PolicyPublicService, SwarmPublicService, and PerfService, with memoized policy instantiation.
 * @type {typeof PolicyConnectionService}
 */
export default PolicyConnectionService;
