import { randomString } from "functools-kit";
import swarm, { ExecutionContextService } from "../lib";

/**
 * Send the message to the active agent in the swarm content like it income from client side
 * Should be used to review tool output and initiate conversation from the model side to client
 *
 * Will execute even if the agent is inactive
 *
 * @param {string} content - The content to be executed.
 * @param {string} clientId - The ID of the client requesting execution.
 * @returns {Promise<void>} - A promise that resolves when the execution is complete.
 */
export const executeForce = async (content: string, clientId: string) => {
  const methodName = "function executeForce";
  const executionId = randomString();
  swarm.loggerService.log("function executeForce", {
    content,
    clientId,
    executionId,
  });
  swarm.sessionValidationService.validate(clientId, "executeForce");
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, "executeForce");
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
