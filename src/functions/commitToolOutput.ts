import { randomString } from "functools-kit";
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
export const commitToolOutput = async (toolId: string, content: string, clientId: string, agentName: AgentName) => {
    const requestId = randomString();
    swarm.loggerService.log('function commitToolOutput', {
        toolId,
        content,
        clientId,
        agentName,
        requestId,
    });
    swarm.agentValidationService.validate(agentName, "commitSystemMessage");
    swarm.sessionValidationService.validate(clientId, "commitToolOutput");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitToolOutput");
    const currentAgentName = await swarm.swarmPublicService.getAgentName(requestId, clientId, swarmName);
    if (currentAgentName !== agentName) {
        swarm.loggerService.log('function "commitToolOutput" skipped due to the agent change', {
            toolId,
            currentAgentName,
            agentName,
            clientId,
        });
        return;
    }
    await swarm.sessionPublicService.commitToolOutput(toolId, content, requestId, clientId, swarmName);
}
