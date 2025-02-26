import { randomString } from "functools-kit";
import swarm from "../lib";

/**
 * Cancel the await of output by emit of empty string without checking active agent
 * 
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the output is canceled
 */
export const cancelOutputForce = async (clientId: string) => {
    const requestId = randomString();
    swarm.loggerService.log('function cancelOutputForce', {
        clientId,
        requestId
    });
    swarm.sessionValidationService.validate(clientId, "cancelOutputForce");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "cancelOutputForce");
    await swarm.swarmPublicService.cancelOutput(requestId, clientId, swarmName);
}
