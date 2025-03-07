import { randomString } from "functools-kit";
import swarm, { ExecutionContextService } from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";

const METHOD_NAME = "function.target.runForce";

/**
 * Complete the message stateless without append to the chat history
 * Use to prevent model from history overflow while handling storage output
 *
 * Will run even if the agent is inactive
 *
 * @param {string} content - The content to be runned.
 * @param {string} clientId - The ID of the client requesting run.
 * @returns {Promise<string>} - A promise that resolves the run result
 */
export const runForce = async (content: string, clientId: string) => {
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
      return await swarm.sessionPublicService.run(
        content,
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
