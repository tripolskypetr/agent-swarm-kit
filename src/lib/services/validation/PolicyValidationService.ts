import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  IPolicySchema,
  PolicyName,
} from "../../../interfaces/Policy.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for validating policies within the swarm system.
 * Manages a map of registered policies, ensuring their uniqueness and existence during validation.
 * Integrates with PolicySchemaService (policy registration), ClientPolicy (policy enforcement),
 * AgentValidationService (potential policy validation for agents), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
 */
export class PolicyValidationService {
  /**
   * Logger service instance for logging validation operations and errors.
   * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @type {LoggerService}
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Map of policy names to their schemas, used to track and validate policies.
   * Populated by addPolicy, queried by validate.
   * @type {Map<PolicyName, IPolicySchema>}
   * @private
   */
  private _policyMap = new Map<PolicyName, IPolicySchema>();

  /**
   * Registers a new policy with its schema in the validation service.
   * Logs the operation and ensures uniqueness, supporting PolicySchemaService’s registration process.
   * @param {PolicyName} policyName - The name of the policy to add, sourced from Policy.interface.
   * @param {IPolicySchema} policySchema - The schema defining the policy’s configuration, sourced from Policy.interface.
   * @throws {Error} If the policy name already exists in _policyMap.
   */
  public addPolicy = (
    policyName: PolicyName,
    policySchema: IPolicySchema
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyValidationService addPolicy", {
        policyName,
        policySchema,
      });
    if (this._policyMap.has(policyName)) {
      throw new Error(`agent-swarm policy ${policyName} already exist`);
    }
    this._policyMap.set(policyName, policySchema);
  };

  /**
   * Validates if a policy name exists in the registered map, memoized by policyName for performance.
   * Logs the operation and checks existence, supporting ClientPolicy’s policy enforcement validation.
   * @param {PolicyName} policyName - The name of the policy to validate, sourced from Policy.interface.
   * @param {string} source - The source of the validation request (e.g., "agent-validate"), for error context.
   * @throws {Error} If the policy name is not found in _policyMap.
   */
  public validate = memoize(
    ([policyName]) => policyName,
    (policyName: PolicyName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("policyValidationService validate", {
          policyName,
          source,
        });
      if (!this._policyMap.has(policyName)) {
        throw new Error(
          `agent-swarm policy ${policyName} not found source=${source}`
        );
      }
      return true as never;
    }
  ) as (policyName: PolicyName, source: string) => void;
}

/**
 * Default export of the PolicyValidationService class.
 * Provides a service for validating policy names in the swarm system,
 * integrating with PolicySchemaService, ClientPolicy, AgentValidationService, and LoggerService,
 * with memoized validation and uniqueness enforcement.
 * @type {typeof PolicyValidationService}
 */
export default PolicyValidationService;
