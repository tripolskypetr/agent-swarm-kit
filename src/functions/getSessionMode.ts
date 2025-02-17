import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

/**
 * Return the session mode (`"session" | "makeConnection" | "complete"`) for clientId
 * 
 * @param {string} clientId - The client ID of the session.
 */
export const getSessionMode = async (
  clientId: string
) => {
  swarm.loggerService.log("function getSessionMode", {
    clientId,
  });
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, "getSessionMode");
  return swarm.sessionValidationService.getSessionMode(clientId);
};
