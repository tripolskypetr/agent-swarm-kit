import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { PolicyName } from "../../interfaces/Policy.interface";

const METHOD_NAME = "function.dump.getPolicy";

/**
 * Retrieves a policy schema by its name from the swarm's policy schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getPolicy
 * @param {PolicyName} policyName - The name of the policy.
*/
export function getPolicy(policyName: PolicyName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      policyName,
    });
  return swarm.policySchemaService.get(policyName);
}
