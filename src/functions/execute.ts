import { randomString } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import swarm, { ExecutionContextService } from "../lib";

const METHOD_NAME = "function execute";

/**
 * Send the message to the active agent in the swarm content like it income from client side
 * Should be used to review tool output and initiate conversation from the model side to client
 *
 * @param {string} content - The content to be executed.
 * @param {string} clientId - The ID of the client requesting execution.
 * @param {AgentName} agentName - The name of the agent executing the command.
 * @returns {Promise<void>} - A promise that resolves when the execution is complete.
 */
export const execute = async (
  content: string,
  clientId: string,
  agentName: AgentName
) => {
  const executionId = randomString();
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      content,
      clientId,
      agentName,
      executionId,
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
        'function "execute" skipped due to the agent change',
        {
          currentAgentName,
          agentName,
          clientId,
        }
      );
    return;
  }
  return ExecutionContextService.runInContext(
    async () => {
      return await swarm.sessionPublicService.execute(
        content,
        "tool",
        METHOD_NAME,
        clientId,
        swarmName
      );
    },
    {
      clientId,
      executionId,
    }
  );
};
