import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { AdvisorName } from "../../interfaces/Advisor.interface";

const METHOD_NAME = "function.dump.getAdvisor";

/**
 * Retrieves an advisor schema by its name from the swarm's advisor schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getAdvisor
 * @param {AdvisorName} advisorName - The name of the advisor.
*/
export function getAdvisor(advisorName: AdvisorName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      advisorName,
    });
  return swarm.advisorSchemaService.get(advisorName);
}
