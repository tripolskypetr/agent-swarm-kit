import beginContext from "../..//utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";

const METHOD_NAME = "function.commit.commitToolOutput";

/**
 * Commits the tool output to the active agent in a swarm session
 *
 * @param {string} content - The content to be committed.
 * @param {string} clientId - The client ID associated with the session.
 * @param {AgentName} agentName - The name of the agent committing the output.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export const commitToolOutput = beginContext(
  async (
    toolId: string,
    content: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        toolId,
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
          'function "commitToolOutput" skipped due to the agent change',
          {
            toolId,
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return;
    }
    await swarm.sessionPublicService.commitToolOutput(
      toolId,
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
