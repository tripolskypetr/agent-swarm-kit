import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

/** @private Constant defining the method name for logging and validation context */
const METHOD_NAME = "function.commit.commitAssistantMessageForce";

/**
 * Function implementation
 */
const commitAssistantMessageForceInternal = beginContext(
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

    // Commit the assistant message via SessionPublicService without agent checks
    await swarm.sessionPublicService.commitAssistantMessage(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Forcefully commits an assistant-generated message to a session in the swarm system, without checking the active agent.
 * Validates the session and swarm, then proceeds with committing the message regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SessionPublicService (message committing), and LoggerService (logging).
 * Unlike commitAssistantMessage, this function skips agent validation and active agent checks, providing a more aggressive commit mechanism,
 * analogous to cancelOutputForce vs. cancelOutput.
 *
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
export async function commitAssistantMessageForce(content: string, clientId: string) {
  return await commitAssistantMessageForceInternal(content, clientId);
}
