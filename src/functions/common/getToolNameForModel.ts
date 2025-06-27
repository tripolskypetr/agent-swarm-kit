import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import { AgentName, ToolName } from "../../interfaces/Agent.interface";

const METHOD_NAME = "function.common.getToolNameForModel";

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

export async function getToolNameForModel(toolName: ToolName, clientId: string, agentName: AgentName) {
  return await getToolNameForModelInternal(toolName, clientId, agentName);
}
