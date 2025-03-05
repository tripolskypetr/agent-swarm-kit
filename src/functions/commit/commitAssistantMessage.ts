import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.commitAssistantMessage";

/**
 * Commits an assistant message to the active agent in the swarm.
 *
 * @param {string} content - The content of the assistant message.
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitAssistantMessage = async (
  content: string,
  clientId: string,
  agentName: string
) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      content,
      clientId,
      agentName,
    });
  swarm.agentValidationService.validate(agentName, METHOD_NAME);
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  const currentAgentName = await swarm.swarmPublicService.getAgentName(
    METHOD_NAME,
    clientId,
    swarmName
  );
  if (currentAgentName !== agentName) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        'function "commitAssistantMessage" skipped due to the agent change',
        {
          currentAgentName,
          agentName,
          clientId,
        }
      );
    return;
  }
  await swarm.sessionPublicService.commitAssistantMessage(
    content,
    METHOD_NAME,
    clientId,
    swarmName
  );
};
