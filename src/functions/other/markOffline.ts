import { SwarmName } from "../../interfaces/Swarm.interface";
import { GLOBAL_CONFIG } from "../../config/params";
import { swarm, MethodContextService } from "../../lib";

const METHOD_NAME = "function.other.markOffline";

/**
 * Function implementation
 */
const markOfflineInternal = async (clientId: string, swarmName: SwarmName): Promise<void> => {
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
      computeName: "",
      mcpName: "",
      swarmName,
      clientId,
    }
  );
};

/**
 * Marks a client as offline in the specified swarm.
 *
 *
 * @throws {Error} If the swarm validation fails or the operation encounters an issue.
 *
 * @example
 * await markOffline("client123", "exampleSwarm");
 */
export async function markOffline(clientId: string, swarmName: SwarmName) {
  return await markOfflineInternal(clientId, swarmName);
}
