import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.common.getCheckBusy";

/**
 * Function implementation
 */
const getCheckBusyInternal = beginContext(async (clientId: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });

  if (!swarm.sessionValidationService.hasSession(clientId)) {
    return false;
  };

  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

  return await swarm.swarmPublicService.getCheckBusy(
    METHOD_NAME,
    clientId,
    swarmName
  );
});

/**
 * Checks if the swarm associated with the given client ID is currently busy.
 *
 * @param {string} clientId - The unique identifier of the client whose swarm status is being checked.
 * @returns {Promise<boolean>} A promise that resolves to true if the swarm is busy, or false otherwise.
 */
export async function getCheckBusy(clientId: string) {
  return await getCheckBusyInternal(clientId);
}
