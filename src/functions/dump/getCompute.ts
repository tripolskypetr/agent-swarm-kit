import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { ComputeName } from "../../interfaces/Compute.interface";

const METHOD_NAME = "function.dump.getCompute";

/**
 * Retrieves a compute schema by its name from the swarm's compute schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getCompute
 * @param {ComputeName} computeName - The name of the compute.
*/
export function getCompute(computeName: ComputeName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      computeName,
    });
  return swarm.computeSchemaService.get(computeName);
}
