import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

/**
 * Commits the tool output to the active agent in a swarm session
 * 
 * @param {string} content - The content to be committed.
 * @param {string} clientId - The client ID associated with the session.
 * @param {AgentName} agentName - The name of the agent committing the output.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
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
