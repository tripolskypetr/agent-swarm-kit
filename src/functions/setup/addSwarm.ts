import { ISwarmSchema } from "../../interfaces/Swarm.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";

const METHOD_NAME = "function.addSwarm";

/**
 * Adds a new swarm to the system. The swarm is a root for starting client session
 *
 * @param {ISwarmSchema} swarmSchema - The schema of the swarm to be added.
 * @returns {string} The name of the added swarm.
 */
export const addSwarm = (swarmSchema: ISwarmSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      swarmSchema,
    });
  swarm.swarmValidationService.addSwarm(swarmSchema.swarmName, swarmSchema);
  swarm.swarmSchemaService.register(swarmSchema.swarmName, swarmSchema);
  return swarmSchema.swarmName;
};
