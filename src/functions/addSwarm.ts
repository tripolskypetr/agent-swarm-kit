import { ISwarmSpec, SwarmName } from "src/interfaces/Swarm.interface";
import swarm from "src/lib";

export const addSwarm = (swarmName: SwarmName, swarmSpec: ISwarmSpec) => {
    swarm.swarmSpecService.register(swarmName, swarmSpec);
};
