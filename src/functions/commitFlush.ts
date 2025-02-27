import { randomString } from "functools-kit";
import swarm from "../lib";

/**
 * Commits flush of agent history
 * 
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitFlush = async (clientId: string, agentName: string) => {
    const requestId = randomString();
    swarm.loggerService.log('function commitFlush', {
        clientId,
        agentName,
        requestId,
    });
    swarm.agentValidationService.validate(agentName, "commitFlush");
    swarm.sessionValidationService.validate(clientId, "commitFlush");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitFlush");
    const currentAgentName = await swarm.swarmPublicService.getAgentName(requestId, clientId, swarmName);
    if (currentAgentName !== agentName) {
        swarm.loggerService.log('function "commitFlush" skipped due to the agent change', {
            currentAgentName,
            agentName,
            clientId,
        });
        return;
    }
    await swarm.sessionPublicService.commitFlush(requestId, clientId, swarmName);
}
