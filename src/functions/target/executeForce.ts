import { randomString } from "functools-kit";
import swarm, { ExecutionContextService } from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";

const METHOD_NAME = "function.target.executeForce";

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
  const executionId = randomString();
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      content,
      clientId,
      executionId,
    });
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  return ExecutionContextService.runInContext(
    async () => {
      let isFinished = false;
      swarm.perfService.startExecution(executionId, clientId, content.length);
      try {
        swarm.busService.commitExecutionBegin(clientId, { swarmName });
        const result = await swarm.sessionPublicService.execute(
          content,
          "tool",
          METHOD_NAME,
          clientId,
          swarmName
        );
        isFinished = swarm.perfService.endExecution(
          executionId,
          clientId,
          result.length
        );
        swarm.busService.commitExecutionEnd(clientId, { swarmName });
        return result;
      } finally {
        if (!isFinished) {
          swarm.perfService.endExecution(executionId, clientId, 0);
        }
      }
    },
    {
      clientId,
      executionId,
    }
  );
};
