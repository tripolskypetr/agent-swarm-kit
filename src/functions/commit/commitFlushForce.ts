import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

/** @private Constant defining the method name for logging and validation context */
const METHOD_NAME = "function.commit.commitFlushForce";

/**
 * Function implementation
 */
const commitFlushForceInternal = beginContext(
  async (clientId: string): Promise<void> => {
    // Log the flush attempt if enabled
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        METHOD_NAME,
      });

    // Validate the session exists and retrieve the associated swarm
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);

    // Validate the swarm configuration
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Commit the flush of agent history via SessionPublicService without agent checks
    await swarm.sessionPublicService.commitFlush(
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Forcefully commits a flush of agent history for a specific client in the swarm system, without checking the active agent.
 * Validates the session and swarm, then proceeds with flushing the history regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SessionPublicService (history flush), and LoggerService (logging).
 * Unlike commitFlush, this function skips agent validation and active agent checks, providing a more aggressive flush mechanism,
 * analogous to commitAssistantMessageForce vs. commitAssistantMessage.
 *
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent (unused in this implementation, included for interface consistency with commitFlush).
 * @returns {Promise<void>} A promise that resolves when the history flush is committed.
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
export async function commitFlushForce(clientId: string) {
  return await commitFlushForceInternal(clientId);
}
