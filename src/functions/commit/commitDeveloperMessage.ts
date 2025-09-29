import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

/** @private Constant defining the method name for logging and validation context */
const METHOD_NAME = "function.commit.commitDeveloperMessage";

/**
 * Function implementation
 */
const commitDeveloperMessageInternal = beginContext(
  async (content: string, clientId: string, agentName: string): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
        agentName,
      });

    swarm.agentValidationService.validate(agentName, METHOD_NAME);

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);

    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    const currentAgentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );
    if (currentAgentName !== agentName) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(
          'function "commitDeveloperMessage" skipped due to the agent change',
          {
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return;
    }

    await swarm.sessionPublicService.commitDeveloperMessage(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Commits a developer-generated message to the active agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the message.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (message committing),
 * and LoggerService (logging). Complements functions like commitSystemMessage by handling developer messages
 * (e.g., user or developer instructions) rather than system-generated or assistant-generated responses.
 *
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
export async function commitDeveloperMessage(content: string, clientId: string, agentName: string) {
  return await commitDeveloperMessageInternal(content, clientId, agentName);
}
