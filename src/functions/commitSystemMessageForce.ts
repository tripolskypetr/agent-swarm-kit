import { randomString } from "functools-kit";
import swarm from "../lib";

/**
 * Commits a system message to the active agent in as swarm without checking active agent.
 * 
 * @param {string} content - The content of the system message.
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitSystemMessageForce = async (content: string, clientId: string) => {
    const methodName = 'function commitSystemMessageForce'
    swarm.loggerService.log('function commitSystemMessageForce', {
        content,
        clientId,
    });
    swarm.sessionValidationService.validate(clientId, "commitSystemMessageForce");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitSystemMessageForce");
    await swarm.sessionPublicService.commitSystemMessage(content, methodName, clientId, swarmName);
}
