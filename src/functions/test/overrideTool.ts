import { IAgentTool } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideTool";

type TAgentTool = {
  toolName: IAgentTool["toolName"];
} & Partial<IAgentTool>;

/**
 * Function implementation
 */
const overrideToolInternal = beginContext((toolSchema: TAgentTool) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      toolSchema,
    });

  return swarm.toolSchemaService.override(toolSchema.toolName, toolSchema);
});

/**
 * Overrides an existing tool schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a tool identified by its `toolName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @param {TAgentTool} toolSchema - The schema containing the tool’s unique name and optional properties to override.
 * @param {string} toolSchema.toolName - The unique identifier of the tool to override, matching `IAgentTool["toolName"]`.
 * @param {Partial<IAgentTool>} [toolSchema] - Optional partial schema properties to update, extending `IAgentTool`.
 * @returns {void} No return value; the override is applied directly to the swarm’s tool schema service.
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
export function overrideTool(toolSchema: TAgentTool) {
  return overrideToolInternal(toolSchema);
}
