import { ISwarmSchema } from "../interfaces/Swarm.interface";
import swarm from "../lib";

/**
 * Adds a new swarm to the system. The swarm is a root for starting client session
 * 
 * @param {ISwarmSchema} swarmSchema - The schema of the swarm to be added.
 * @returns {string} The name of the added swarm.
 */
export const addSwarm = (swarmSchema: ISwarmSchema) => {
    swarm.loggerService.log('function addSwarm', {
        swarmSchema,
    });
    swarm.swarmValidationService.addSwarm(swarmSchema.swarmName, swarmSchema);
    swarm.swarmSchemaService.register(swarmSchema.swarmName, swarmSchema);
    return swarmSchema.swarmName;
};
