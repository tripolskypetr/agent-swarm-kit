import { GLOBAL_CONFIG } from "../../config/params";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";

const METHOD_NAME = "function.getAgentHistory";

/**
 * Retrieves the history prepared for a specific agent with resque algorithm tweaks
 *
 * @param {string} clientId - The ID of the client.
 * @param {AgentName} agentName - The name of the agent.
 * @returns {Promise<Array>} - A promise that resolves to an array containing the agent's history.
 */
export const getAgentHistory = async (
  clientId: string,
  agentName: AgentName
) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
      agentName,
    });
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  swarm.agentValidationService.validate(agentName, METHOD_NAME);
  const { prompt } = swarm.agentSchemaService.get(agentName);
  const history = await swarm.historyPublicService.toArrayForAgent(
    prompt,
    METHOD_NAME,
    clientId,
    agentName
  );
  return [...history];
};
