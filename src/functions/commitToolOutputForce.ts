import { randomString } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

/**
 * Commits the tool output to the active agent in a swarm session without checking active agent
 * 
 * @param {string} content - The content to be committed.
 * @param {string} clientId - The client ID associated with the session.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export const commitToolOutputForce = async (toolId: string, content: string, clientId: string) => {
    const requestId = randomString();
    swarm.loggerService.log('function commitToolOutputForce', {
        toolId,
        content,
        clientId,
        requestId,
    });
    swarm.sessionValidationService.validate(clientId, "commitToolOutputForce");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitToolOutputForce");
    await swarm.sessionPublicService.commitToolOutput(toolId, content, requestId, clientId, swarmName);
}
