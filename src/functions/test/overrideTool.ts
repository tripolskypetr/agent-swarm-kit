import { IAgentTool, ToolValue } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

const METHOD_NAME = "function.test.overrideTool";

/**
 * Type representing a partial agent tool schema with required toolName.
 * Used for overriding existing tool configurations with selective updates.
 * Combines required tool name with optional tool properties.
*/
type TAgentTool<T extends any = Record<string, ToolValue>> = {
  toolName: IAgentTool<T>["toolName"];
} & Partial<IAgentTool<T>>;

/**
 * Function implementation
*/
const overrideToolInternal = beginContext(async (publicToolSchema: TAgentTool<unknown>) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      toolSchema: publicToolSchema,
    });

  await swarm.agentValidationService.validate(publicToolSchema.toolName, METHOD_NAME);

  const toolSchema = removeUndefined(publicToolSchema);

  return swarm.toolSchemaService.override(toolSchema.toolName, toolSchema);
});

/**
 * Overrides an existing tool schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a tool identified by its `toolName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @param toolSchema Tool schema configuration defining the tool's name, function, and metadata.
 * @throws {Error} If the tool schema service encounters an error during the override operation (e.g., invalid toolName or schema).
 *
 * @example
 * // Override a tool’s schema with new properties
 * overrideTool({
 *   toolName: "WeatherTool",
 *   description: "Updated weather data retrieval tool",
 *   execute: async (params) => fetchWeather(params),
 * });
 * // Logs the operation (if enabled) and updates the tool schema in the swarm.
*/
export async function overrideTool<T extends any = Record<string, ToolValue>>(toolSchema: TAgentTool<T>) {
  return await overrideToolInternal(toolSchema);
}
