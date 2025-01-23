import { AgentName } from "../interfaces/Agent.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

export const changeAgent = async (agentName: AgentName, clientId: string, swarmName: SwarmName) => {
    await swarm.swarmPublicService.setAgentName(agentName, clientId, swarmName);
};
