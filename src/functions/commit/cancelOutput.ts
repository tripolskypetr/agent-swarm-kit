import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

/** @private Constant defining the method name for logging and validation context */
const METHOD_NAME = "function.commit.cancelOutput";

/**
 * Function implementation
 */
const cancelOutputInternal = beginContext(
  async (clientId: string, agentName: string): Promise<void> => {
    // Log the cancellation attempt if enabled
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
          'function "cancelOutput" skipped due to the agent change',
          {
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return;
    }

    // Perform the output cancellation via SwarmPublicService
    await swarm.swarmPublicService.cancelOutput(
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Cancels the awaited output for a specific client and agent by emitting an empty string.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before cancellation.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), and SwarmPublicService (agent retrieval and output cancellation).
 *
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
export async function cancelOutput(clientId: string, agentName: string) {
  return await cancelOutputInternal(clientId, agentName);
}
