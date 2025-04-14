import { IAgentSchema } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideAgent";

type TAgentSchema = {
  agentName: IAgentSchema["agentName"];
} & Partial<IAgentSchema>;

export const overrideAgent = beginContext((agentSchema: TAgentSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      agentSchema,
    });

  return swarm.agentSchemaService.override(agentSchema.agentName, agentSchema);
});
