import { queued, randomString, singleshot, ttl } from "functools-kit";
import { SwarmName } from "../../interfaces/Swarm.interface";
import swarm, { ExecutionContextService } from "../../lib";
import { disposeConnection } from "./disposeConnection";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../..//utils/beginContext";

const METHOD_NAME = "function.target.complete";

/**
 * Type definition for the complete run function.
 * @typedef {function(string): Promise<string>} TCompleteRun
 */
type TCompleteRun = (METHOD_NAME: string, content: string) => Promise<string>;

const COMPLETE_TTL = 15 * 60 * 1_000;
const COMPLETE_GC = 60 * 1_000;

/**
 * Creates a complete function with TTL and queuing.
 * @param {string} clientId - The client ID.
 * @param {SwarmName} swarmName - The swarm name.
 * @returns {TCompleteRun} The complete run function.
 */
const createComplete = ttl(
  (clientId: string, swarmName: SwarmName) =>
    queued(async (METHOD_NAME: string, content: string) => {
      swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
      swarm.sessionValidationService.addSession(
        clientId,
        swarmName,
        "complete"
      );
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
 * @returns {Promise<void>} A promise that resolves when the GC is set up.
 */
const createGc = singleshot(async () => {
  setInterval(createComplete.gc, COMPLETE_GC);
});

/**
 * The complete function will create a swarm, execute single command and dispose it
 * Best for developer needs like troubleshooting tool execution
 *
 * @param {string} content - The content to process.
 * @param {string} clientId - The client ID.
 * @param {SwarmName} swarmName - The swarm name.
 * @returns {Promise<string>} The result of the complete function.
 */
export const complete = beginContext(
  async (content: string, clientId: string, swarmName: SwarmName) => {
    const executionId = randomString();
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
        executionId,
        swarmName,
      });
    const run = await createComplete(clientId, swarmName);
    createGc();
    return ExecutionContextService.runInContext(
      async () => {
        let isFinished = false;
        swarm.perfService.startExecution(executionId, clientId, content.length);
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
  }
);
