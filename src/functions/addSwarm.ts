import { ISwarmSchema, SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

export const addSwarm = (swarmName: SwarmName, swarmSchema: ISwarmSchema) => {
    swarm.swarmValidationService.addSwarm(swarmName, swarmSchema);
    swarm.swarmSchemaService.register(swarmName, swarmSchema);
};
