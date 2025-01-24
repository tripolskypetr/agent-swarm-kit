import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

export const changeAgent = async (agentName: AgentName, clientId: string) => {
    swarm.sessionValidationService.validate(clientId);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    await swarm.swarmPublicService.setAgentName(agentName, clientId, swarmName);
};
