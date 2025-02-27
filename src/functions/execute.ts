import { randomString } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import swarm, { ExecutionContextService } from "../lib";

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
  const methodName = "function execute";
  const executionId = randomString();
  swarm.loggerService.log("function execute", {
    content,
    clientId,
    agentName,
    methodName,
    executionId,
  });
  swarm.agentValidationService.validate(agentName, "execute");
  swarm.sessionValidationService.validate(clientId, "execute");
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, "execute");
  const currentAgentName = await swarm.swarmPublicService.getAgentName(
    methodName,
    clientId,
    swarmName
  );
  if (currentAgentName !== agentName) {
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
        methodName,
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
