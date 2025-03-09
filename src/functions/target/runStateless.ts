import { randomString } from "functools-kit";
import { AgentName } from "../../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm, { ExecutionContextService } from "../../lib";
import beginContext from "src/utils/beginContext";

const METHOD_NAME = "function.target.runStateless";

/**
 * Complete the message stateless without append to the chat history
 * Use to prevent model from history overflow while handling storage output
 *
 * @param {string} content - The content to be runned.
 * @param {string} clientId - The ID of the client requesting run.
 * @param {AgentName} agentName - The name of the agent running the command.
 * @returns {Promise<string>} - A promise that resolves the run result
 */
export const runStateless = beginContext(
  async (content: string, clientId: string, agentName: AgentName) => {
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
          'function "runStateless" skipped due to the agent change',
          {
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return "";
    }
    return ExecutionContextService.runInContext(
      async () => {
        let isFinished = false;
        swarm.perfService.startExecution(executionId, clientId, content.length);
        try {
          swarm.busService.commitExecutionBegin(clientId, {
            agentName,
            swarmName,
          });
          const result = await swarm.sessionPublicService.run(
            content,
            METHOD_NAME,
            clientId,
            swarmName
          );
          isFinished = swarm.perfService.endExecution(
            executionId,
            clientId,
            result.length
          );
          swarm.busService.commitExecutionEnd(clientId, {
            agentName,
            swarmName,
          });
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
  }
);
