import { IAgentTool, ToolValue } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../..//utils/beginContext";

const METHOD_NAME = "function.setup.addTool";

/**
 * Adds a new tool for agents in a swarm. Tool should be registered in `addAgent`
 * declaration
 *
 * @param {IAgentTool} toolSchema - The schema of the tool to be added.
 * @returns {string} The name of the tool that was added.
 */
export const addTool = beginContext((toolSchema: IAgentTool) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      toolSchema,
    });
  swarm.toolValidationService.addTool(toolSchema.toolName, toolSchema);
  swarm.toolSchemaService.register(toolSchema.toolName, toolSchema);
  return toolSchema.toolName;
}) as <T extends any = ToolValue>(storageSchema: IAgentTool<T>) => string;
