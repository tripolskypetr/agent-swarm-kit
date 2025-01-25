import { ISwarmSchema } from "../interfaces/Swarm.interface";
import swarm from "../lib";

export const addSwarm = (swarmSchema: ISwarmSchema) => {
    swarm.loggerService.log('function addSwarm', {
        swarmSchema,
    });
    swarm.swarmValidationService.addSwarm(swarmSchema.swarmName, swarmSchema);
    swarm.swarmSchemaService.register(swarmSchema.swarmName, swarmSchema);
    return swarmSchema.swarmName;
};
