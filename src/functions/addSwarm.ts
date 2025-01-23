import { ISwarmSchema, SwarmName } from "src/interfaces/Swarm.interface";
import swarm from "src/lib";

export const addSwarm = (swarmName: SwarmName, swarmSchema: ISwarmSchema) => {
    swarm.swarmSchemaService.register(swarmName, swarmSchema);
};
