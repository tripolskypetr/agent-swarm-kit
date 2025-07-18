import { randomString } from "functools-kit";
import swarm, { ExecutionContextService } from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.target.executeForce";

/**
 * Function implementation
 */
const executeForceInternal = beginContext(
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

    // Execute the command within an execution context with performance tracking
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
          swarm.executionValidationService.decrementCount(executionId, clientId, swarmName);
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
 * Sends a message to the active agent in a swarm session as if it originated from the client side, forcing execution regardless of agent activity.
 *
 * This function executes a command or message on behalf of the active agent within a swarm session, designed for scenarios like reviewing tool output
 * or initiating a model-to-client conversation. Unlike `execute`, it does not check if the agent is currently active, ensuring execution even if the
 * agent has changed or is inactive. It validates the session and swarm, executes the content with performance tracking and event bus notifications,
 * and is wrapped in `beginContext` for a clean environment and `ExecutionContextService` for metadata tracking.
 *
 * @param {string} content - The content or command to be executed by the active agent.
 * @param {string} clientId - The unique identifier of the client session requesting the execution.
 * @returns {Promise<string>} A promise that resolves to the result of the execution.
 * @throws {Error} If session or swarm validation fails, or if the execution process encounters an error.
 * @example
 * const result = await executeForce("Force this execution", "client-123");
 * console.log(result); // Outputs the agent's response regardless of its active state
 */
export async function executeForce(content: string, clientId: string) {
  return await executeForceInternal(content, clientId);
}
