import beginContext from "src/utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.commit.commitSystemMessage";

/**
 * Commits a user message to the active agent history in as swarm without answer and checking active agent
 *
 * @param {string} content - The content of the message.
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitUserMessageForce = beginContext(
  async (content: string, clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
      });
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    await swarm.sessionPublicService.commitUserMessage(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
