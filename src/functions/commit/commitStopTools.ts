import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

/** @private Constant defining the method name for logging and validation context*/
const METHOD_NAME = "function.commit.commitStopTools";

/**
 * Function implementation
*/
const commitStopToolsInternal = beginContext(
  async (clientId: string, agentName: string): Promise<void> => {
    // Log the stop tools attempt if enabled
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
          'function "commitStopTools" skipped due to the agent change',
          {
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return;
    }

    // Commit the stop of the next tool execution via SessionPublicService
    await swarm.sessionPublicService.commitStopTools(
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);


/**
 * Prevents the next tool from being executed for a specific client and agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before stopping tool execution.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (tool execution stop),
 * ToolValidationService (tool context), and LoggerService (logging). Complements functions like commitFlush by controlling tool flow rather than clearing history.
 *
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @param {string} agentName - The name of the agent to use or reference.
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
*/
export async function commitStopTools(clientId: string, agentName: string) {
  return await commitStopToolsInternal(clientId, agentName);
}
