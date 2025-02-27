import { randomString } from "functools-kit";
import swarm from "../lib";

/**
 * Commits a user message to the active agent history in as swarm without answer.
 * 
 * @param {string} content - The content of the message.
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitUserMessage = async (content: string, clientId: string, agentName: string) => {
    const requestId = randomString();
    swarm.loggerService.log('function commitSystemMessage', {
        content,
        clientId,
        agentName,
        requestId,
    });
    swarm.agentValidationService.validate(agentName, "commitUserMessage");
    swarm.sessionValidationService.validate(clientId, "commitUserMessage");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitUserMessage");
    const currentAgentName = await swarm.swarmPublicService.getAgentName(requestId, clientId, swarmName);
    if (currentAgentName !== agentName) {
        swarm.loggerService.log('function "commitUserMessage" skipped due to the agent change', {
            currentAgentName,
            agentName,
            clientId,
        });
        return;
    }
    await swarm.sessionPublicService.commitUserMessage(content, requestId, clientId, swarmName);
}
