import swarm from "src/lib";

/**
 * Commits a user message to the active agent history in as swarm without answer.
 * 
 * @param {string} content - The content of the message.
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitUserMessage = async (content: string, clientId: string, agentName: string) => {
    swarm.loggerService.log('function commitSystemMessage', {
        content,
        clientId,
        agentName,
    });
    swarm.agentValidationService.validate(agentName, "commitUserMessage");
    swarm.sessionValidationService.validate(clientId, "commitUserMessage");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitUserMessage");
    const currentAgentName = await swarm.swarmPublicService.getAgentName(clientId, swarmName);
    if (currentAgentName !== agentName) {
        swarm.loggerService.log('function "commitUserMessage" skipped due to the agent change', {
            currentAgentName,
            agentName,
            clientId,
        });
        return;
    }
    await swarm.sessionPublicService.commitUserMessage(content, clientId, swarmName);
}
