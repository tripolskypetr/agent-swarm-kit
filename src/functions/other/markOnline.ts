import { SwarmName } from "../../interfaces/Swarm.interface";
import { GLOBAL_CONFIG } from "../../config/params";
import { swarm, MethodContextService } from "../../lib";

const METHOD_NAME = "function.other.markOnline";

/**
 * Marks a client as online in the specified swarm.
 *
 * @param {string} clientId - The unique identifier of the client to mark as online.
 * @param {SwarmName} swarmName - The name of the swarm where the client is being marked online.
 * @returns {Promise<void>} A promise that resolves when the client is successfully marked online.
 * @throws {Error} Throws an error if the swarm validation fails or if the operation fails.
 */
export const markOnline = async (clientId: string, swarmName: SwarmName): Promise<void> => {
  // Log the operation if logging is enabled in the global configuration
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });

  // Validate the swarm name
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

  // Run the operation in the method context
  return await MethodContextService.runInContext(
    async () => {
      await swarm.aliveService.markOnline(clientId, swarmName, METHOD_NAME);
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
