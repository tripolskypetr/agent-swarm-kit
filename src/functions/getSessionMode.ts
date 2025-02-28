import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

/**
 * Return the session mode (`"session" | "makeConnection" | "complete"`) for clientId
 *
 * @param {string} clientId - The client ID of the session.
 */
export const getSessionMode = async (clientId: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log("function getSessionMode", {
      clientId,
    });
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, "getSessionMode");
  return swarm.sessionValidationService.getSessionMode(clientId);
};
