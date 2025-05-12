import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

/** @private Constant defining the method name for logging and validation context */
const METHOD_NAME = "function.commit.commitSystemMessageForce";

/**
 * Function implementation
 */
const commitSystemMessageForceInternal = beginContext(
  async (content: string, clientId: string): Promise<void> => {
    // Log the commit attempt if enabled
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
      });

    // Validate the session exists and retrieve the associated swarm
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);

    // Validate the swarm configuration
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Commit the system message via SessionPublicService without agent checks
    await swarm.sessionPublicService.commitSystemMessage(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Forcefully commits a system-generated message to a session in the swarm system, without checking the active agent.
 * Validates the session and swarm, then proceeds with committing the message regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SessionPublicService (message committing), and LoggerService (logging).
 * Unlike commitSystemMessage, this function skips agent validation and active agent checks, providing a more aggressive commit mechanism,
 * analogous to commitAssistantMessageForce vs. commitAssistantMessage.
 *
 * @param {string} content - The content of the system message to commit, typically related to system state or control instructions.
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent (unused in this implementation, included for interface consistency with commitSystemMessage).
 * @returns {Promise<void>} A promise that resolves when the message is committed.
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
export function commitSystemMessageForce(content: string, clientId: string) {
  return commitSystemMessageForceInternal(content, clientId);
}
