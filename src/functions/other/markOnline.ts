import { SwarmName } from "../../interfaces/Swarm.interface";
import { GLOBAL_CONFIG } from "../../config/params";
import { swarm, MethodContextService } from "../../lib";

const METHOD_NAME = "function.other.markOnline";

/**
 * Function implementation
 */
const markOnlineInternal = async (clientId: string, swarmName: SwarmName): Promise<void> => {
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
      computeName: "",
      mcpName: "",
      swarmName,
      clientId,
    }
  );
};

/**
 * Marks a client as online in the specified swarm.
 *
 * @throws {Error} Throws an error if the swarm validation fails or if the operation fails.
 */
export async function markOnline(clientId: string, swarmName: SwarmName) {
  return await markOnlineInternal(clientId, swarmName);
}
