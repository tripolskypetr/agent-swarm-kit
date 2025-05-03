import { GLOBAL_CONFIG } from "../../config/params";
import History from "../../classes/History";
import { SwarmName } from "../../interfaces/Swarm.interface";
import swarm from "../../lib";
import LoggerAdapter from "../../classes/Logger";
import { AgentName } from "../../interfaces/Agent.interface";
import { StorageName } from "../../interfaces/Storage.interface";
import { StateName } from "../../interfaces/State.interface";
import beginContext from "../../utils/beginContext";
import { PersistMemoryAdapter } from "../../classes/Persist";
import { markOffline } from "../other/markOffline";
import { ComputeName } from "../../interfaces/Compute.interface";

const METHOD_NAME = "function.target.disposeConnection";

/**
 * Disposes of a client session and all related resources within a swarm.
 *
 * This function terminates a client session, cleaning up associated swarm, agent, storage, state, and auxiliary resources (e.g., history, logs, performance metrics).
 * It ensures that all dependencies are properly disposed of to prevent resource leaks, using sets to avoid redundant disposal of shared resources.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 * The function logs the operation if enabled and resolves when all disposal tasks are complete.
 *
 * @param {string} clientId - The unique identifier of the client session to dispose of.
 * @param {SwarmName} swarmName - The name of the swarm associated with the session.
 * @param {string} [methodName="function.target.disposeConnection"] - The name of the method invoking the disposal (defaults to `METHOD_NAME`).
 * @returns {Promise<void>} A promise that resolves when the session and all related resources are fully disposed.
 * @throws {Error} If session or swarm validation fails, or if any disposal operation encounters an error.
 * @example
 * await disposeConnection("client-123", "TaskSwarm");
 */
export const disposeConnection = beginContext(
  async (clientId: string, swarmName: SwarmName, methodName = METHOD_NAME) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        swarmName,
      });

    // Validate the session and swarm
    swarm.sessionValidationService.validate(clientId, methodName);
    swarm.swarmValidationService.validate(swarmName, methodName);

    // Dispose of session and swarm resources
    await swarm.sessionPublicService.dispose(methodName, clientId, swarmName);
    await swarm.swarmPublicService.dispose(methodName, clientId, swarmName);

    // Dispose of agent-related resources (agents and their histories)
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

    // Dispose of storage resources associated with agents
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

    // Dispose of state resources associated with agents
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

    // Dispose of compute resources associated with agents
    {
      const computeDisposeSet = new Set<StateName>();
      await Promise.all(
        swarm.sessionValidationService
          .getSessionComputeList(clientId)
          .filter((computeName: ComputeName) => {
            const { shared } = swarm.computeSchemaService.get(computeName);
            return !shared;
          })
          .map(async (computeName) => {
            if (computeDisposeSet.has(computeName)) {
              return;
            }
            computeDisposeSet.add(computeName);
            await swarm.computePublicService.dispose(
              methodName,
              clientId,
              computeName
            );
          })
      );
    }

    // Dispose of mcp resources associated with agents
    {
      const mcpDisposeSet = new Set<StateName>();
      await Promise.all(
        swarm.swarmValidationService
          .getAgentList(swarmName)
          .flatMap((agentName) =>
            swarm.agentValidationService.getMCPList(agentName)
          )
          .filter((mcpName) => !!mcpName)
          .map(async (mcpName) => {
            if (mcpDisposeSet.has(mcpName)) {
              return;
            }
            mcpDisposeSet.add(mcpName);
            await swarm.mcpPublicService.dispose(methodName, clientId, mcpName);
          })
      );
    }

    // Dispose of auxiliary services and remove the session
    await History.dispose(clientId, null);
    await LoggerAdapter.dispose(clientId);

    // Mark the client offline
    await markOffline(clientId, swarmName);

    {
      swarm.busService.dispose(clientId);
      swarm.sessionValidationService.dispose(clientId);
      swarm.memorySchemaService.dispose(clientId);
      swarm.perfService.dispose(clientId);
    }

    {
      swarm.sessionValidationService.removeSession(clientId);
      swarm.navigationValidationService.dispose(clientId, swarmName);
    }

    PersistMemoryAdapter.dispose(clientId);
  }
);
