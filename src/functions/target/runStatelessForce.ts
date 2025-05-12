import { randomString } from "functools-kit";
import swarm, { ExecutionContextService } from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.target.runStatelessForce";

/**
 * Function implementation
 */
const runStatelessForceInternal = beginContext(
  async (content: string, clientId: string) => {
    const executionId = randomString();

    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
        executionId,
      });

    // Validate the session and swarm
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Execute the command statelessly within an execution context with performance tracking
    return ExecutionContextService.runInContext(
      async () => {
        let isFinished = false;
        swarm.perfService.startExecution(executionId, clientId, content.length);
        try {
          swarm.busService.commitExecutionBegin(clientId, { swarmName });
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
        processId: GLOBAL_CONFIG.CC_PROCESS_UUID,
      }
    );
  }
);


/**
 * Executes a message statelessly with the active agent in a swarm session, bypassing chat history and forcing execution regardless of agent activity.
 *
 * This function processes a command or message using the active agent without appending it to the chat history, designed to prevent model history
 * overflow when handling storage output or one-off tasks. Unlike `runStateless`, it does not check if the agent is currently active, ensuring execution
 * even if the agent has changed or is inactive. It validates the session and swarm, executes the content with performance tracking and event bus
 * notifications, and is wrapped in `beginContext` for a clean environment and `ExecutionContextService` for metadata tracking.
 *
 * @param {string} content - The content or command to be executed statelessly by the active agent.
 * @param {string} clientId - The unique identifier of the client session requesting the execution.
 * @returns {Promise<string>} A promise that resolves to the result of the execution.
 * @throws {Error} If session or swarm validation fails, or if the execution process encounters an error.
 * @example
 * const result = await runStatelessForce("Process this data forcefully", "client-123");
 * console.log(result); // Outputs the agent's response without affecting history
 */
export async function runStatelessForce(content: string, clientId: string) {
  return await runStatelessForceInternal(content, clientId);
}
