import { ISwarmSchema } from "../interfaces/Swarm.interface";
import swarm from "../lib";

export const addSwarm = (swarmSchema: ISwarmSchema) => {
    swarm.swarmValidationService.addSwarm(swarmSchema.swarmName, swarmSchema);
    swarm.swarmSchemaService.register(swarmSchema.swarmName, swarmSchema);
    return swarmSchema.swarmName;
};
