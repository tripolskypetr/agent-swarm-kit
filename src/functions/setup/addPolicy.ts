import { IPolicySchema } from "../../interfaces/Policy.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

/** @private Constant defining the method name for logging and validation context*/
const METHOD_NAME = "function.setup.addPolicy";

/**
 * Function implementation
*/
const addPolicyInternal = beginContext((policySchema: IPolicySchema): string => {
  // Log the policy addition attempt if enabled
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      policySchema,
    });

  // Register the policy with PolicyValidationService for runtime validation
  swarm.policyValidationService.addPolicy(
    policySchema.policyName,
    policySchema
  );

  // Register the policy schema with PolicySchemaService for schema management
  swarm.policySchemaService.register(policySchema.policyName, policySchema);

  // Return the policy name as confirmation of successful addition
  return policySchema.policyName;
});

/**
 * Adds a new policy for agents in the swarm system by registering it with validation and schema services.
 * Registers the policy with PolicyValidationService for runtime validation and PolicySchemaService for schema management.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with PolicyValidationService (policy registration and validation), PolicySchemaService (schema registration),
 * and LoggerService (logging). Part of the swarm setup process, enabling policies to govern agent behavior,
 * complementing runtime functions like commitAssistantMessage by defining operational rules upfront.
 *
 *
 * @param {IPolicySchema} policySchema - The schema definition for policy.
 * @throws {Error} If policy registration fails due to validation errors in PolicyValidationService or PolicySchemaService.
*/
export function addPolicy(policySchema: IPolicySchema) {
  return addPolicyInternal(policySchema);
}
