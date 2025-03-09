import beginContext from "../..//utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.commit.commitAssistantMessageForce";

/**
 * Commits an assistant message to the active agent in as swarm without checking active agent.
 *
 * @param {string} content - The content of the assistant message.
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitAssistantMessageForce = beginContext(
  async (content: string, clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
      });
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    await swarm.sessionPublicService.commitAssistantMessage(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
