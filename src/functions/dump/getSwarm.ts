import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";

const METHOD_NAME = "function.dump.getSwarm";

/**
 * Retrieves a swarm schema by its name from the swarm's swarm schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getSwarm
 * @param {SwarmName} swarmName - The name of the swarm to operate on.
 */
export function getSwarm(swarmName: SwarmName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      swarmName,
    });
  return swarm.swarmSchemaService.get(swarmName);
}
