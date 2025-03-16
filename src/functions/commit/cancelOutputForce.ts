import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

/** @private Constant defining the method name for logging and validation context */
const METHOD_NAME = "function.commit.cancelOutputForce";

/**
 * Forcefully cancels the awaited output for a specific client by emitting an empty string, without checking the active agent.
 * Validates the session and swarm, then proceeds with cancellation regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SwarmPublicService (output cancellation), and LoggerService (logging).
 * Unlike cancelOutput, this function skips agent validation and active agent checks, providing a more aggressive cancellation mechanism.
 *
 * @param {string} clientId - The ID of the client whose output is to be canceled, validated against active sessions.
 * @param {string} agentName - The name of the agent (unused in this implementation, included for interface consistency with cancelOutput).
 * @returns {Promise<void>} A promise that resolves when the output cancellation is complete.
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
export const cancelOutputForce = beginContext(
  async (clientId: string): Promise<void> => {
    // Log the cancellation attempt if enabled
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
      });

    // Validate the session exists and retrieve the associated swarm
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);

    // Validate the swarm configuration
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Perform the output cancellation via SwarmPublicService without agent checks
    await swarm.swarmPublicService.cancelOutput(
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
