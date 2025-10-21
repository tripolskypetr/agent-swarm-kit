import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";

const METHOD_NAME = "function.common.getAgentHistory";

/**
 * Function implementation
 */
const getAgentHistoryInternal = beginContext(
  async (clientId: string, agentName: AgentName) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        agentName,
      });

    // Validate the session and agent to ensure they exist and are accessible
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    swarm.agentValidationService.validate(agentName, METHOD_NAME);

    // Retrieve the agent's prompt configuration from the agent schema service
    const { prompt: upperPrompt } = swarm.agentSchemaService.get(agentName);

    const prompt = upperPrompt
      ? typeof upperPrompt === "string"
        ? upperPrompt
        : await upperPrompt(clientId, agentName)
      : "";

    // Fetch the agent's history using the prompt and rescue tweaks via the history public service
    const history = await swarm.historyPublicService.toArrayForAgent(
      prompt,
      METHOD_NAME,
      clientId,
      agentName
    );

    // Return a shallow copy of the history array
    return [...history];
  }
);

/**
 * Retrieves the history prepared for a specific agent, incorporating rescue algorithm tweaks.
 *
 * This function fetches the history tailored for a specified agent within a swarm session, applying any rescue strategies defined in the system (e.g., `CC_RESQUE_STRATEGY` from `GLOBAL_CONFIG`).
 * It validates the client session and agent, logs the operation if enabled, and retrieves the history using the agent's prompt configuration via the history public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @param {AgentName} agentName - The name of the agent to use or reference.
 * @throws {Error} If validation fails (e.g., invalid session or agent) or if the history public service encounters an error during retrieval.
 * @example
 * const history = await getAgentHistory("client-123", "AgentX");
 * console.log(history); // Outputs array of IModelMessage objects
 */
export async function getAgentHistory(clientId: string, agentName: AgentName) {
  return await getAgentHistoryInternal(clientId, agentName);
}
