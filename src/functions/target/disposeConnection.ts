import { GLOBAL_CONFIG } from "../../config/params";
import History from "../../classes/History";
import { SwarmName } from "../../interfaces/Swarm.interface";
import swarm from "../../lib";
import LoggerAdapter from "../../classes/Logger";
import { AgentName } from "../../interfaces/Agent.interface";
import { StorageName } from "../../interfaces/Storage.interface";
import { StateName } from "../../interfaces/State.interface";
import beginContext from "../..//utils/beginContext";

const METHOD_NAME = "function.target.disposeConnection";

/**
 * Disposes the session for a given client with all related swarms and agents.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {Promise<void>} A promise that resolves when the connection is disposed.
 */
export const disposeConnection = beginContext(
  async (clientId: string, swarmName: SwarmName, methodName = METHOD_NAME) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        swarmName,
      });

    swarm.sessionValidationService.validate(clientId, methodName);
    swarm.swarmValidationService.validate(swarmName, methodName);
    await swarm.sessionPublicService.dispose(methodName, clientId, swarmName);
    await swarm.swarmPublicService.dispose(methodName, clientId, swarmName);

    {
      const agentDisposeSet = new Set<AgentName>();
      await Promise.all(
        swarm.swarmValidationService
          .getAgentList(swarmName)
          .map(async (agentName) => {
            if (agentDisposeSet.has(agentName)) {
              return;
            }
            agentDisposeSet.add(agentName);
            await swarm.agentPublicService.dispose(
              methodName,
              clientId,
              agentName
            );
            await swarm.historyPublicService.dispose(
              methodName,
              clientId,
              agentName
            );
          })
      );
    }

    {
      const storageDisposeSet = new Set<StorageName>();
      await Promise.all(
        swarm.swarmValidationService
          .getAgentList(swarmName)
          .flatMap((agentName) =>
            swarm.agentValidationService.getStorageList(agentName)
          )
          .filter((storageName) => !!storageName)
          .map(async (storageName) => {
            if (storageDisposeSet.has(storageName)) {
              return;
            }
            storageDisposeSet.add(storageName);
            await swarm.storagePublicService.dispose(
              methodName,
              clientId,
              storageName
            );
          })
      );
    }

    {
      const stateDisposeSet = new Set<StateName>();
      await Promise.all(
        swarm.swarmValidationService
          .getAgentList(swarmName)
          .flatMap((agentName) =>
            swarm.agentValidationService.getStateList(agentName)
          )
          .filter((stateName) => !!stateName)
          .map(async (stateName) => {
            if (stateDisposeSet.has(stateName)) {
              return;
            }
            stateDisposeSet.add(stateName);
            await swarm.statePublicService.dispose(
              methodName,
              clientId,
              stateName
            );
          })
      );
    }

    await History.dispose(clientId, null);
    await LoggerAdapter.dispose(clientId);
    {
      swarm.busService.dispose(clientId);
      swarm.sessionValidationService.dispose(clientId);
      swarm.memorySchemaService.dispose(clientId);
      swarm.perfService.dispose(clientId);
    }
    swarm.sessionValidationService.removeSession(clientId);
  }
);
