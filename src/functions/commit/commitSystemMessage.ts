import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

/** @private Constant defining the method name for logging and validation context */
const METHOD_NAME = "function.commit.commitSystemMessage";

/**
 * Function implementation
 */
const commitSystemMessageInternal = beginContext(
  async (content: string, clientId: string, agentName: string): Promise<void> => {
    // Log the commit attempt if enabled
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
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
          'function "commitSystemMessage" skipped due to the agent change',
          {
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return;
    }

    // Commit the system message via SessionPublicService
    await swarm.sessionPublicService.commitSystemMessage(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Commits a system-generated message to the active agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the message.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (message committing),
 * and LoggerService (logging). Complements functions like commitAssistantMessage by handling system messages (e.g., configuration or control messages)
 * rather than assistant-generated responses.
 *
 *
 * @param {string} content - The content to be processed or stored.
 * @param {string} clientId - The unique identifier of the client session.
 * @param {string} agentName - The name of the agent to use or reference.
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
export async function commitSystemMessage(content: string, clientId: string, agentName: string) {
  return await commitSystemMessageInternal(content, clientId, agentName);
}
