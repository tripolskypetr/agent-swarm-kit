import { IAgentTool } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideTool";

type TAgentTool = {
  toolName: IAgentTool['toolName'];
} & Partial<IAgentTool>;

export const overrideTool = beginContext((toolSchema: TAgentTool) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      toolSchema,
    });

  return swarm.toolSchemaService.override(toolSchema.toolName, toolSchema);
})