import { IPolicySchema } from "../../interfaces/Policy.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";

const METHOD_NAME = "function.setup.addPolicy";

/**
 * Adds a new policy for agents in a swarm. Policy should be registered in `addPolicy`
 * declaration
 *
 * @param {IPolicySchema} policySchema - The schema of the policy to be added.
 * @returns {string} The name of the policy that was added.
 */
export const addPolicy = (policySchema: IPolicySchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      policySchema,
    });
  swarm.policyValidationService.addPolicy(policySchema.policyName, policySchema);
  swarm.policySchemaService.register(policySchema.policyName, policySchema);
  return policySchema.policyName;
};
