import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { ToolName } from "../../interfaces/Agent.interface";

const METHOD_NAME = "function.dump.getTool";

/**
 * Retrieves a tool schema by its name from the swarm's tool schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getTool
 * @param {ToolName} toolName - The name of the tool.
*/
export function getTool(toolName: ToolName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      toolName,
    });
  return swarm.toolSchemaService.get(toolName);
}
