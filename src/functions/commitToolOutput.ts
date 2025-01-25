import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

export const commitToolOutput = async (content: string, clientId: string, agentName: AgentName) => {
    swarm.loggerService.log('function commitToolOutput', {
        content,
        clientId,
        agentName,
    });
    swarm.agentValidationService.validate(agentName, "commitSystemMessage");
    swarm.sessionValidationService.validate(clientId, "commitToolOutput");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitToolOutput");
    const currentAgentName = await swarm.swarmPublicService.getAgentName(clientId, swarmName);
    if (currentAgentName !== agentName) {
        swarm.loggerService.log('function "commitToolOutput" skipped due to the agent change', {
            currentAgentName,
            agentName,
            clientId,
        });
        return;
    }
    await swarm.sessionPublicService.commitToolOutput(content, clientId, swarmName);
}
