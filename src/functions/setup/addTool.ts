import { IAgentTool, ToolValue } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.setup.addTool";

/**
 * Function implementation
 */
const addToolInternal = beginContext((toolSchema: IAgentTool<unknown>) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      toolSchema,
    });

  // Register the tool in the validation and schema services
  swarm.toolValidationService.addTool(toolSchema.toolName, toolSchema);
  swarm.toolSchemaService.register(toolSchema.toolName, toolSchema);

  // Return the tool's name as confirmation of registration
  return toolSchema.toolName;
});

/**
 * Adds a new tool to the tool registry for use by agents in the swarm system.
 *
 * This function registers a new tool, enabling agents within the swarm to utilize it for performing specific tasks or operations.
 * Tools must be registered through this function to be recognized by the swarm, though the original comment suggests an association with
 * `addAgent`, likely intending that tools are linked to agent capabilities. The execution is wrapped in `beginContext` to ensure it runs
 * outside of existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled
 * and returns the tool's name upon successful registration.
 *
 * @template T - The type of the tool's input/output data, defaulting to a record of string keys and `ToolValue` values if unspecified.
 * @param {IAgentTool<T>} toolSchema - The schema defining the tool's properties, including its name (`toolName`) and other configuration details (e.g., function, description).
 * @returns {string} The name of the newly added tool (`toolSchema.toolName`), confirming its registration.
 * @throws {Error} If the tool schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate tool name).
 * @example
 * const toolSchema = { toolName: "Calculator", fn: (x: number) => x * 2, description: "Doubles a number" };
 * const toolName = addTool(toolSchema);
 * console.log(toolName); // Outputs "Calculator"
 */
export function addTool<T extends any = Record<string, ToolValue>>(toolSchema: IAgentTool<T>) {
  return addToolInternal(toolSchema);
}
