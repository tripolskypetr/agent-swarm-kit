import { ISwarmSchema } from "../../interfaces/Swarm.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideSwarm";

type TSwarmSchema = {
  swarmName: ISwarmSchema["swarmName"];
} & Partial<ISwarmSchema>;

export const overrideSwarm = beginContext((swarmSchema: TSwarmSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      swarmSchema,
    });

  return swarm.swarmSchemaService.override(swarmSchema.swarmName, swarmSchema);
});
