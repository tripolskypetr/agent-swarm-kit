import { randomString } from "functools-kit";
import { AgentName } from "../../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm, { ExecutionContextService } from "../../lib";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.target.runStateless";

/**
 * Function implementation
 */
const runStatelessInternal = beginContext(
  async (content: string, clientId: string, agentName: AgentName) => {
    const executionId = randomString();

    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
        agentName,
        executionId,
      });

    // Validate the agent, session, and swarm
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Check if the specified agent is still the active agent
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

    // Execute the command statelessly within an execution context with performance tracking
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
        processId: GLOBAL_CONFIG.CC_PROCESS_UUID,
      }
    );
  }
);

/**
 * Executes a message statelessly with an agent in a swarm session, bypassing chat history.
 *
 * This function processes a command or message using the specified agent without appending it to the chat history, designed to prevent
 * model history overflow when handling storage output or one-off tasks. It validates the agent, session, and swarm, checks if the specified
 * agent is still active, and executes the content with performance tracking and event bus notifications. The execution is wrapped in
 * `beginContext` for a clean environment and `ExecutionContextService` for metadata tracking. If the active agent has changed, the operation
 * is skipped, returning an empty string.
 *
 * @param {string} content - The content or command to be executed statelessly by the agent.
 * @param {string} clientId - The unique identifier of the client session requesting the execution.
 * @param {AgentName} agentName - The name of the agent intended to execute the command.
 * @returns {Promise<string>} A promise that resolves to the result of the execution, or an empty string if skipped due to an agent change.
 * @throws {Error} If agent, session, or swarm validation fails, or if the execution process encounters an error.
 * @example
 * const result = await runStateless("Process this data", "client-123", "AgentX");
 * console.log(result); // Outputs the agent's response without affecting history
 */
export function runStateless(content: string, clientId: string, agentName: AgentName) {
  return runStatelessInternal(content, clientId, agentName);
}
