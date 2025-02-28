import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";

const METHOD_NAME = "function.commitFlushForce";

/**
 * Commits flush of agent history without active agent check
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
export const commitFlushForce = async (clientId: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
      METHOD_NAME,
    });
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  await swarm.sessionPublicService.commitFlush(METHOD_NAME, clientId, swarmName);
};
