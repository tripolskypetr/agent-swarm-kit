import { randomString } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

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
  const requestId = randomString();
  swarm.loggerService.log("function getAgentHistory", {
    clientId,
    agentName,
    requestId,
  });
  swarm.agentValidationService.validate(agentName, "getAgentHistory");
  const { prompt } = swarm.agentSchemaService.get(agentName);
  const history = await swarm.historyPublicService.toArrayForAgent(
    prompt,
    requestId,
    clientId,
    agentName
  );
  return [...history];
};
