import swarm from "../lib";

/**
 * Retrieves the raw history as it is for a given client ID without any modifications.
 * 
 * @param {string} clientId - The ID of the client whose history is to be retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array containing the raw history.
 */
export const getRawHistory = async (clientId: string) => {
  swarm.loggerService.log("function getRawHistory", {
    clientId,
  });
  swarm.sessionValidationService.validate(clientId, "getRawHistory");
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, "getRawHistory");
  const agentName = await swarm.swarmPublicService.getAgentName(
    clientId,
    swarmName
  );
  const history = await swarm.historyPublicService.toArrayForRaw(
    clientId,
    agentName
  );
  return [...history];
};
