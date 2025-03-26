import { SwarmName } from "../../interfaces/Swarm.interface";
import { GLOBAL_CONFIG } from "../../config/params";
import { swarm, MethodContextService } from "../../lib";

const METHOD_NAME = "function.other.markOffline";

/**
 * Marks a client as offline in the specified swarm.
 *
 * @param {string} clientId - The unique identifier of the client to mark as offline.
 * @param {SwarmName} swarmName - The name of the swarm where the client belongs.
 * @returns {Promise<void>} A promise that resolves when the client is successfully marked as offline.
 *
 * @throws {Error} If the swarm validation fails or the operation encounters an issue.
 *
 * @example
 * await markOffline("client123", "exampleSwarm");
 */
export const markOffline = async (clientId: string, swarmName: SwarmName): Promise<void> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  return await MethodContextService.runInContext(
    async () => {
      await swarm.aliveService.markOffline(clientId, swarmName, METHOD_NAME);
    },
    {
      methodName: METHOD_NAME,
      agentName: "",
      policyName: "",
      stateName: "",
      storageName: "",
      swarmName,
      clientId,
    }
  );
};