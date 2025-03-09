import beginContext from "../..//utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.target.emitForce";

/**
 * Emits a string constant as the model output without executing incoming message and checking active agent
 * Works only for `makeConnection`
 *
 * @param {string} content - The content to be emitted.
 * @param {string} clientId - The client ID of the session.
 * @param {AgentName} agentName - The name of the agent to emit the content to.
 * @throws Will throw an error if the session mode is not "makeConnection".
 * @returns {Promise<void>} A promise that resolves when the content is emitted.
 */
export const emitForce = beginContext(
  async (content: string, clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
      });
    if (
      swarm.sessionValidationService.getSessionMode(clientId) !==
      "makeConnection"
    ) {
      throw new Error(
        `agent-swarm-kit emitForce session is not makeConnection clientId=${clientId}`
      );
    }
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    return await swarm.sessionPublicService.emit(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
