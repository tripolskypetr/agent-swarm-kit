import swarm from "../lib";

/**
 * Commits a system message to the active agent in as swarm.
 * 
 * @param {string} content - The content of the system message.
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitSystemMessage = async (content: string, clientId: string, agentName: string) => {
    swarm.loggerService.log('function commitSystemMessage', {
        content,
        clientId,
        agentName,
    });
    swarm.agentValidationService.validate(agentName, "commitSystemMessage");
    swarm.sessionValidationService.validate(clientId, "commitSystemMessage");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitSystemMessage");
    const currentAgentName = await swarm.swarmPublicService.getAgentName(clientId, swarmName);
    if (currentAgentName !== agentName) {
        swarm.loggerService.log('function "commitSystemMessage" skipped due to the agent change', {
            currentAgentName,
            agentName,
            clientId,
        });
        return;
    }
    await swarm.sessionPublicService.commitSystemMessage(content, clientId, swarmName);
}
