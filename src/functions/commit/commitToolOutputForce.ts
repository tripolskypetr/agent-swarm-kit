import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.commit.commitToolOutputForce";

/**
 * Function implementation
 */
const commitToolOutputForceInternal = beginContext(
  async (toolId: string, content: string, clientId: string) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        toolId,
        content,
        clientId,
      });

    // Validate the session and swarm to ensure they exist and are accessible
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Commit the tool output to the session via the session public service without checking the active agent
    await swarm.sessionPublicService.commitToolOutput(
      toolId,
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Commits the output of a tool execution to the active agent in a swarm session without checking the active agent.
 *
 * This function forcefully commits the tool output to the session, bypassing the check for whether the agent is still active in the swarm session.
 * It performs validation on the session and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} toolId - The unique identifier of the tool whose output is being committed.
 * @param {string} content - The content or result of the tool execution to be committed.
 * @param {string} clientId - The unique identifier of the client session associated with the operation.
 * @returns {Promise<void>} A promise that resolves when the tool output is successfully committed.
 * @throws {Error} If validation fails (e.g., invalid session or swarm) or if the session public service encounters an error during the commit operation.
 * @example
 * await commitToolOutputForce("tool-123", "Tool execution result", "client-456");
 */
export function commitToolOutputForce(toolId: string, content: string, clientId: string) {
  return commitToolOutputForceInternal(toolId, content, clientId);
}
