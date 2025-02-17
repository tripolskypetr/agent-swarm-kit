import swarm from "../lib";

/**
 * Commits a user message to the active agent history in as swarm without answer and checking active agent
 * 
 * @param {string} content - The content of the message.
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitUserMessageForce = async (content: string, clientId: string) => {
    swarm.loggerService.log('function commitSystemMessage', {
        content,
        clientId,
    });
    swarm.sessionValidationService.validate(clientId, "commitUserMessageForce");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitUserMessageForce");
    await swarm.sessionPublicService.commitUserMessage(content, clientId, swarmName);
}
