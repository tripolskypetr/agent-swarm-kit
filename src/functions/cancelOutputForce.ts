import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";

const METHOD_NAME = "function cancelOutputForce";

/**
 * Cancel the await of output by emit of empty string without checking active agent
 *
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the output is canceled
 */
export const cancelOutputForce = async (clientId: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  await swarm.swarmPublicService.cancelOutput(METHOD_NAME, clientId, swarmName);
};
