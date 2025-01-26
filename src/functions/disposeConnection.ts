import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

/**
 * Disposes the session for a given client with all related swarms and agents.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {Promise<void>} A promise that resolves when the connection is disposed.
 */
export const disposeConnection = async (
  clientId: string,
  swarmName: SwarmName
) => {
  swarm.loggerService.log("function disposeConnection", {
    clientId,
    swarmName,
  });
  swarm.swarmValidationService.validate(swarmName, "disposeConnection");
  swarm.sessionValidationService.removeSession(clientId);
  await swarm.sessionPublicService.dispose(clientId, swarmName);
  await swarm.swarmPublicService.dispose(clientId, swarmName);
  await Promise.all([
    swarm.swarmValidationService
      .getAgentList(swarmName)
      .map(async (agentName) => {
        await swarm.agentPublicService.dispose(clientId, agentName);
        await swarm.historyPublicService.dispose(clientId, agentName);
      }),
  ]);
};
