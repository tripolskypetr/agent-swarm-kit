import { AgentName } from "../interfaces/Agent.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

export const changeAgent = async (agentName: AgentName, clientId: string) => {
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    await swarm.swarmPublicService.setAgentName(agentName, clientId, swarmName);
};
