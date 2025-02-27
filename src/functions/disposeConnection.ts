import { randomString } from "functools-kit";
import History from "../classes/History";
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
  swarmName: SwarmName,
  requestId = randomString(),
) => {
  swarm.loggerService.log("function disposeConnection", {
    clientId,
    swarmName,
    requestId,
  });
  swarm.swarmValidationService.validate(swarmName, "disposeConnection");
  swarm.sessionValidationService.removeSession(clientId);
  swarm.busService.dispose(clientId);
  await swarm.sessionPublicService.dispose(requestId, clientId, swarmName);
  await swarm.swarmPublicService.dispose(requestId, clientId, swarmName);
  await Promise.all(
    swarm.swarmValidationService
      .getAgentList(swarmName)
      .map(async (agentName) => {
        await swarm.agentPublicService.dispose(requestId, clientId, agentName);
        await swarm.historyPublicService.dispose(requestId, clientId, agentName);
      })
  );
  await Promise.all(
    swarm.swarmValidationService
      .getAgentList(swarmName)
      .flatMap((agentName) =>
        swarm.agentValidationService.getStorageList(agentName)
      )
      .filter((storageName) => !!storageName)
      .map(async (storageName) => {
        await swarm.storagePublicService.dispose(requestId, clientId, storageName);
      })
  );
  await Promise.all(
    swarm.swarmValidationService
      .getAgentList(swarmName)
      .flatMap((agentName) =>
        swarm.agentValidationService.getStateList(agentName)
      )
      .filter((stateName) => !!stateName)
      .map(async (stateName) => {
        await swarm.statePublicService.dispose(requestId, clientId, stateName);
      })
  );
  await History.dispose(clientId, null);
};
