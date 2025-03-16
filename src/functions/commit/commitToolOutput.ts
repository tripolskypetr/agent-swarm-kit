import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";

const METHOD_NAME = "function.commit.commitToolOutput";

/**
 * Commits the output of a tool execution to the active agent in a swarm session.
 *
 * This function ensures that the tool output is committed only if the specified agent is still the active agent in the swarm session.
 * It performs validation checks on the agent, session, and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} toolId - The unique identifier of the tool whose output is being committed.
 * @param {string} content - The content or result of the tool execution to be committed.
 * @param {string} clientId - The unique identifier of the client session associated with the operation.
 * @param {AgentName} agentName - The name of the agent committing the tool output.
 * @returns {Promise<void>} A promise that resolves when the tool output is successfully committed, or immediately if the operation is skipped due to an agent change.
 * @throws {Error} If validation fails (e.g., invalid agent, session, or swarm) or if the session public service encounters an error during the commit operation.
 * @example
 * await commitToolOutput("tool-123", "Tool execution result", "client-456", "AgentX");
 */
export const commitToolOutput = beginContext(
  async (
    toolId: string,
    content: string,
    clientId: string,
    agentName: AgentName
  ) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        toolId,
        content,
        clientId,
        agentName,
      });

    // Validate the agent, session, and swarm to ensure they exist and are accessible
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Check if the specified agent is still the active agent in the swarm session
    const currentAgentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );
    if (currentAgentName !== agentName) {
      // Log a skip message if the agent has changed during the operation
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(
          'function "commitToolOutput" skipped due to the agent change',
          {
            toolId,
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return;
    }

    // Commit the tool output to the session via the session public service
    await swarm.sessionPublicService.commitToolOutput(
      toolId,
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
