import { ToolRegistry } from "functools-kit";
import {
  PolicyName,
  IPolicySchema,
} from "../../../interfaces/Policy.interface";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import { GLOBAL_CONFIG } from "../../../config/params";
import TYPES from "../../core/types";

/**
 * Service class for managing policy schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IPolicySchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with PolicyConnectionService (policy enforcement via getBannedClients), ClientAgent (policy application during execution), SessionConnectionService (session-level policy checks), and PolicyPublicService (public policy API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining policy logic (e.g., getBannedClients function) to manage access control and restrictions within the swarm ecosystem.
 */
export class PolicySchemaService {
  /**
   * Logger service instance, injected via DI, for logging policy schema operations.
   * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with PolicyConnectionService and PerfService logging patterns.
   * @type {LoggerService}
   * @readonly
   */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Registry instance for storing policy schemas, initialized with ToolRegistry from functools-kit.
   * Maps PolicyName keys to IPolicySchema values, providing efficient storage and retrieval, used in register and get methods.
   * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
   * @type {ToolRegistry<Record<PolicyName, IPolicySchema>>}
   * @private
   */
  private registry = new ToolRegistry<Record<PolicyName, IPolicySchema>>(
    "policySchemaService"
  );

  /**
   * Validates a policy schema shallowly, ensuring required fields meet basic integrity constraints.
   * Checks policyName as a string and getBannedClients as a function, critical for policy enforcement in PolicyConnectionService.
   * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with PolicyConnectionService’s needs.
   * Supports ClientAgent and SessionConnectionService by ensuring policy schema validity before registration.
   * @param {IPolicySchema} policySchema - The policy schema to validate, sourced from Policy.interface.
   * @throws {Error} If any validation check fails, with detailed messages including policyName.
   * @private
   */
  private validateShallow = (policySchema: IPolicySchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policySchemaService validateShallow`, {
        policySchema,
      });
    if (typeof policySchema.policyName !== "string") {
      throw new Error(
        `agent-swarm policy schema validation failed: missing policyName`
      );
    }
    if (typeof policySchema.getBannedClients !== "function") {
      throw new Error(
        `agent-swarm policy schema validation failed: missing getBannedClients policyName=${policySchema.policyName}`
      );
    }
  };

  /**
   * Registers a new policy schema in the registry after validation.
   * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (policyName).
   * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with PolicyConnectionService’s policy enforcement.
   * Supports ClientAgent execution and SessionConnectionService by providing validated policy schemas for access control.
   * @param {PolicyName} key - The name of the policy, used as the registry key, sourced from Policy.interface.
   * @param {IPolicySchema} value - The policy schema to register, sourced from Policy.interface, validated before storage.
   * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
   */
  public register = (key: PolicyName, value: IPolicySchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policySchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves a policy schema from the registry by its name.
   * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports PolicyConnectionService’s getBannedClients method by providing policy logic, used in ClientAgent execution and SessionConnectionService session management.
   * @param {PolicyName} key - The name of the policy to retrieve, sourced from Policy.interface.
   * @returns {IPolicySchema} The policy schema associated with the key, sourced from Policy.interface, including the getBannedClients function.
   * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
   */
  public get = (key: PolicyName): IPolicySchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policySchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * Default export of the PolicySchemaService class.
 * Provides the primary service for managing policy schemas in the swarm system, integrating with PolicyConnectionService, ClientAgent, SessionConnectionService, and PolicyPublicService, with validated schema storage via ToolRegistry.
 * @type {typeof PolicySchemaService}
 */
export default PolicySchemaService;
