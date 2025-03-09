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
 * Service for managing policy schemas.
 */
export class PolicySchemaService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<Record<PolicyName, IPolicySchema>>(
    "policySchemaService"
  );

  /**
   * Validation for policy schema
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
   * Registers a new policy schema.
   * @param {PolicyName} key - The name of the policy.
   * @param {IPolicySchema} value - The schema of the policy.
   */
  public register = (key: PolicyName, value: IPolicySchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policySchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves an policy schema by name.
   * @param {PolicyName} key - The name of the policy.
   * @returns {IPolicySchema} The schema of the policy.
   */
  public get = (key: PolicyName): IPolicySchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policySchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default PolicySchemaService;
