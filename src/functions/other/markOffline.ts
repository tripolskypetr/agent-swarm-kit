import { SwarmName } from "../../interfaces/Swarm.interface";
import { GLOBAL_CONFIG } from "../../config/params";
import { swarm, MethodContextService } from "../../lib";

const METHOD_NAME = "function.other.markOffline";

export const markOffline = async (clientId: string, swarmName: SwarmName) => {
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
