import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

/** @private Constant defining the method name for logging and validation context */
const METHOD_NAME = "function.commit.commitFlush";

/**
 * Commits a flush of agent history for a specific client and agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before flushing the history.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (history flush),
 * and LoggerService (logging). Complements functions like commitAssistantMessage by clearing agent history rather than adding messages.
 *
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent whose history is to be flushed, validated against registered agents.
 * @returns {Promise<void>} A promise that resolves when the history flush is committed or skipped (e.g., agent mismatch).
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
export const commitFlush = beginContext(
  async (clientId: string, agentName: string): Promise<void> => {
    // Log the flush attempt if enabled
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        agentName,
      });

    // Validate the agent exists
    swarm.agentValidationService.validate(agentName, METHOD_NAME);

    // Validate the session exists and retrieve the associated swarm
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);

    // Validate the swarm configuration
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Check if the current agent matches the provided agent
    const currentAgentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );
    if (currentAgentName !== agentName) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(
          'function "commitFlush" skipped due to the agent change',
          {
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return;
    }

    // Commit the flush of agent history via SessionPublicService
    await swarm.sessionPublicService.commitFlush(
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
