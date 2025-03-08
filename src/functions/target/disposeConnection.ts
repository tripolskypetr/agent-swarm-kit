import { GLOBAL_CONFIG } from "../../config/params";
import History from "../../classes/History";
import { SwarmName } from "../../interfaces/Swarm.interface";
import swarm from "../../lib";
import LoggerAdapter from "../../classes/Logger";

const METHOD_NAME = "function.target.disposeConnection";

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
  methodName = METHOD_NAME
) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
      swarmName,
    });
  swarm.sessionValidationService.validate(clientId, methodName);
  swarm.swarmValidationService.validate(swarmName, methodName);
  await swarm.sessionPublicService.dispose(methodName, clientId, swarmName);
  await swarm.swarmPublicService.dispose(methodName, clientId, swarmName);
  await Promise.all(
    swarm.swarmValidationService
      .getAgentList(swarmName)
      .map(async (agentName) => {
        await swarm.agentPublicService.dispose(methodName, clientId, agentName);
        await swarm.historyPublicService.dispose(
          methodName,
          clientId,
          agentName
        );
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
        await swarm.storagePublicService.dispose(
          methodName,
          clientId,
          storageName
        );
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
        await swarm.statePublicService.dispose(methodName, clientId, stateName);
      })
  );
  await History.dispose(clientId, null);
  await LoggerAdapter.dispose(clientId);
  {
    swarm.busService.dispose(clientId);
    swarm.sessionValidationService.dispose(clientId);
    swarm.memorySchemaService.dispose(clientId);
    swarm.perfService.dispose(clientId);
  }
  swarm.sessionValidationService.removeSession(clientId);
};
