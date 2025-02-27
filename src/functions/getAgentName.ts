import { randomString } from "functools-kit";
import swarm from "../lib";

/**
 * Retrieves the agent name for a given client ID.
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<string>} The name of the agent.
 * @throws Will throw an error if the client ID is invalid or if the swarm validation fails.
 */
export const getAgentName = async (clientId: string) => {
  const requestId = randomString();
  swarm.loggerService.log("function getAgentName", {
    clientId,
    requestId,
  });
  swarm.sessionValidationService.validate(clientId, "getAgentName");
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, "getAgentName");
  return await swarm.swarmPublicService.getAgentName(
    requestId,
    clientId,
    swarmName
  );
};
