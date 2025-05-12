import { IPolicySchema } from "../../interfaces/Policy.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overridePolicy";

type TPolicySchema = {
  policyName: IPolicySchema["policyName"];
} & Partial<IPolicySchema>;

/**
 * Function implementation
 */
const overridePolicyInternal = beginContext((policySchema: TPolicySchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      policySchema,
    });

  return swarm.policySchemaService.override(policySchema.policyName, policySchema);
});

/**
 * Overrides an existing policy schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a policy identified by its `policyName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @param {TPolicySchema} policySchema - The schema containing the policy’s unique name and optional properties to override.
 * @param {string} policySchema.policyName - The unique identifier of the policy to override, matching `IPolicySchema["policyName"]`.
 * @param {Partial<IPolicySchema>} [policySchema] - Optional partial schema properties to update, extending `IPolicySchema`.
 * @returns {void} No return value; the override is applied directly to the swarm’s policy schema service.
 * @throws {Error} If the policy schema service encounters an error during the override operation (e.g., invalid policyName or schema).
 *
 * @example
 * // Override a policy’s schema with new properties
 * overridePolicy({
 *   policyName: "ContentFilter",
 *   autoBan: true,
 *   banMessage: "Content policy violation detected.",
 * });
 * // Logs the operation (if enabled) and updates the policy schema in the swarm.
 */
export function overridePolicy(policySchema: TPolicySchema) {
  return overridePolicyInternal(policySchema);
}
