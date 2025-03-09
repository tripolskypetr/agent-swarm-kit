import beginContext from "../..//utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.history.getRawHistory";

/**
 * Retrieves the raw history as it is for a given client ID without any modifications.
 *
 * @param {string} clientId - The ID of the client whose history is to be retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array containing the raw history.
 */
export const getRawHistory = beginContext(async (
  clientId: string,
  methodName = METHOD_NAME,
) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });
  swarm.sessionValidationService.validate(clientId, methodName);
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, methodName);
  const agentName = await swarm.swarmPublicService.getAgentName(
    methodName,
    clientId,
    swarmName
  );
  const history = await swarm.historyPublicService.toArrayForRaw(
    methodName,
    clientId,
    agentName
  );
  return [...history];
});
