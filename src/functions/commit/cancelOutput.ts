import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";

const METHOD_NAME = "function.commit.cancelOutput";

/**
 * Cancel the await of output by emit of empty string
 *
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the output is canceled
 */
export const cancelOutput = async (clientId: string, agentName: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
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
        'function "cancelOutput" skipped due to the agent change',
        {
          currentAgentName,
          agentName,
          clientId,
        }
      );
    return;
  }
  await swarm.swarmPublicService.cancelOutput(METHOD_NAME, clientId, swarmName);
};
