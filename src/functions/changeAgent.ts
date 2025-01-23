import { AgentName } from "src/interfaces/Agent.interface";
import { SwarmName } from "src/interfaces/Swarm.interface";
import swarm from "src/lib";

export const changeAgent = async (agentName: AgentName, clientId: string, swarmName: SwarmName) => {
    await swarm.swarmPublicService.setAgentName(agentName, clientId, swarmName);
};
