import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

/** @private Constant defining the method name for logging and validation context */
const METHOD_NAME = "function.commit.commitDeveloperMessageForce";

/**
 * Internal implementation for forcefully committing a developer message to a session in the swarm system.
 * Logs the operation if enabled, validates the session and swarm, and commits the message via SessionPublicService.
 * Skips agent validation and active agent checks, providing a more aggressive commit mechanism.
 *
 * @throws {Error} If session or swarm validation fails.
 */
const commitDeveloperMessageForceInternal = beginContext(
  async (content: string, clientId: string): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
      });

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);

    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    await swarm.sessionPublicService.commitDeveloperMessage(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Forcefully commits a developer-generated message to a session in the swarm system, without checking the active agent.
 * Validates the session and swarm, then proceeds with committing the message regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SessionPublicService (message committing), and LoggerService (logging).
 * Unlike commitDeveloperMessage, this function skips agent validation and active agent checks, providing a more aggressive commit mechanism,
 * analogous to commitAssistantMessageForce vs. commitAssistantMessage.
 *
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
export async function commitDeveloperMessageForce(content: string, clientId: string) {
  return await commitDeveloperMessageForceInternal(content, clientId);
}
