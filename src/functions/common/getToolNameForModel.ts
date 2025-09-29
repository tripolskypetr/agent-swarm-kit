import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import { AgentName, ToolName } from "../../interfaces/Agent.interface";

/**
 * Provides a utility to retrieve the model-facing name of a tool for a given agent and client context.
 * Validates tool and agent existence, logs the operation if enabled, and supports both static and dynamic tool name resolution.
 */
const METHOD_NAME = "function.common.getToolNameForModel";

/**
 * Internal implementation for resolving the model-facing tool name.
 * Validates the tool and agent, logs the operation, and invokes the tool schema's function property if dynamic.
 *
 * @private
 */
const getToolNameForModelInternal = beginContext(async (toolName: ToolName, clientId: string, agentName: AgentName) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      toolName,
      clientId,
      agentName,
    });

  swarm.toolValidationService.validate(toolName, METHOD_NAME);
  swarm.agentValidationService.validate(agentName, METHOD_NAME);

  const { function: fn } = swarm.toolSchemaService.get(toolName);

  if (typeof fn === "function") {
    const { name } = await fn(clientId, agentName);
    return name;
  }

  return fn.name;
});

/**
 * Resolves the model-facing name for a tool, given its name, client, and agent context.
 * This is the main exported function for external usage.
 *
 * @example
 * const modelToolName = await getToolNameForModel("search-tool", "client-123", "assistant-agent");
 */
export async function getToolNameForModel(toolName: ToolName, clientId: string, agentName: AgentName) {
  return await getToolNameForModelInternal(toolName, clientId, agentName);
}
