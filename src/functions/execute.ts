import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

export const execute = async (content: string, clientId: string, agentName: AgentName) => {
    swarm.agentValidationService.validate(agentName, "commitSystemMessage");
    swarm.sessionValidationService.validate(clientId, "execute");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "execute");
    const currentAgentName = await swarm.swarmPublicService.getAgentName(clientId, swarmName);
    if (currentAgentName !== agentName) {
        swarm.loggerService.log('function "execute" skipped due to the agent change', {
            currentAgentName,
            agentName,
            clientId,
        });
        return;
    }
    return await swarm.sessionPublicService.execute(content, clientId, swarmName);
};
