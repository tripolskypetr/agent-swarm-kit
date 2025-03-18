import { queued, randomString, singleshot, ttl } from "functools-kit";
import { SwarmName } from "../../interfaces/Swarm.interface";
import swarm, { ExecutionContextService } from "../../lib";
import { disposeConnection } from "./disposeConnection";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import PayloadContextService from "../../lib/services/context/PayloadContextService";
import { markOnline } from "../other/markOnline";

const METHOD_NAME = "function.target.complete";

/**
 * Type definition for the complete run function.
 * Represents the function signature used to execute a single command within a swarm session.
 * @typedef {Function} TCompleteRun
 * @param {string} METHOD_NAME - The name of the method invoking the complete operation.
 * @param {string} content - The content to process in the swarm session.
 * @returns {Promise<string>} A promise that resolves to the result of the command execution.
 */
type TCompleteRun = (METHOD_NAME: string, content: string) => Promise<string>;

/**
 * Time-to-live for the complete function in milliseconds.
 * Defines how long the cached complete function remains valid before expiring.
 * @constant {number}
 */
const COMPLETE_TTL = 15 * 60 * 1_000;

/**
 * Garbage collection interval for the complete function in milliseconds.
 * Specifies the frequency at which expired TTL entries are cleaned up.
 * @constant {number}
 */
const COMPLETE_GC = 60 * 1_000;

/**
 * Creates a complete function with time-to-live (TTL) and queuing capabilities.
 *
 * This factory function generates a queued, TTL-limited function to handle single command execution in a swarm session,
 * ensuring operations are executed sequentially and cached results are reused within the TTL period.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm in which the command is executed.
 * @returns {TCompleteRun} A function that performs the complete operation with queuing and TTL.
 */
const createComplete = ttl(
  (clientId: string, swarmName: SwarmName) =>
    queued(async (METHOD_NAME: string, content: string) => {
      // Validate the swarm and initialize a completion session
      swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
      swarm.sessionValidationService.addSession(
        clientId,
        swarmName,
        "complete"
      );

      // Execute the command and dispose of the session
      const result = await swarm.sessionPublicService.execute(
        content,
        "user",
        METHOD_NAME,
        clientId,
        swarmName
      );
      await disposeConnection(clientId, swarmName, METHOD_NAME);
      return result;
    }) as TCompleteRun,
  {
    key: ([clientId, swarmName]) => `${clientId}-${swarmName}`,
    timeout: COMPLETE_TTL,
  }
);

/**
 * Creates a garbage collector for the complete function.
 *
 * This function sets up a singleton interval-based garbage collector to periodically clean up expired TTL entries from `createComplete`.
 *
 * @returns {Promise<void>} A promise that resolves when the garbage collector is initialized.
 */
const createGc = singleshot(async () => {
  setInterval(createComplete.gc, COMPLETE_GC);
});

/**
 * Executes a single command in a swarm session and disposes of it, optimized for developer troubleshooting.
 *
 * This function creates a temporary swarm session, executes a provided command, and disposes of the session upon completion.
 * It is designed for developer needs, such as testing tool execution or troubleshooting, with performance tracking and event bus notifications.
 * The execution is wrapped in `beginContext` for a clean environment and runs within an `ExecutionContextService` context for metadata tracking.
 * The operation is TTL-limited and queued to manage resource usage efficiently.
 *
 * @param {string} content - The content or command to process in the swarm session.
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm in which the command is executed.
 * @returns {Promise<string>} A promise that resolves to the result of the command execution.
 * @throws {Error} If swarm or session validation fails, execution encounters an error, or disposal fails.
 * @example
 * const result = await complete("Calculate 2 + 2", "client-123", "MathSwarm");
 * console.log(result); // Outputs "4"
 */
export const complete = beginContext(
  async <Payload extends object = object>(
    content: string,
    clientId: string,
    swarmName: SwarmName,
    payload: Payload = null as Payload
  ) => {
    const executionId = randomString();

    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
        executionId,
        swarmName,
      });

    await markOnline(clientId, swarmName);

    // Set up the TTL-limited, queued execution function and garbage collector
    const run = await createComplete(clientId, swarmName);
    createGc();

    // Execute the command within an execution context with performance tracking
    const handleRun = async () => {
      return await ExecutionContextService.runInContext(
        async () => {
          let isFinished = false;
          swarm.perfService.startExecution(
            executionId,
            clientId,
            content.length
          );
          try {
            swarm.busService.commitExecutionBegin(clientId, { swarmName });
            const result = await run(METHOD_NAME, content);
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
    };

    if (payload) {
      return await PayloadContextService.runInContext(handleRun, {
        clientId,
        payload,
      });
    }

    return await handleRun();
  }
) as <Payload extends object = object>(
  content: string,
  clientId: string,
  swarmName: SwarmName,
  payload?: Payload
) => Promise<string>;
