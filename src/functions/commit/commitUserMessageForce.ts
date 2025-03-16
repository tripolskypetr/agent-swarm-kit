import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.commit.commitSystemMessage";

/**
 * Commits a user message to the active agent's history in a swarm session without triggering a response and without checking the active agent.
 *
 * This function forcefully commits a user message to the history of the active agent in the specified swarm session, bypassing the check for whether the agent is still active.
 * It performs validation on the session and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} content - The content of the user message to be committed.
 * @param {string} clientId - The unique identifier of the client session associated with the operation.
 * @returns {Promise<void>} A promise that resolves when the message is successfully committed.
 * @throws {Error} If validation fails (e.g., invalid session or swarm) or if the session public service encounters an error during the commit operation.
 * @example
 * await commitUserMessageForce("User input message", "client-123");
 */
export const commitUserMessageForce = beginContext(
  async (content: string, clientId: string) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
      });

    // Validate the session and swarm to ensure they exist and are accessible
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Commit the user message to the agent's history via the session public service without checking the active agent
    await swarm.sessionPublicService.commitUserMessage(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
