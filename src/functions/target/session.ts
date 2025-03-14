import { queued, randomString, rate, schedule } from "functools-kit";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";
import swarm, { ExecutionContextService } from "../../lib";
import { disposeConnection } from "./disposeConnection";
import { commitUserMessage } from "../commit/commitUserMessage";
import { getAgentName } from "../common/getAgentName";
import beginContext from "../..//utils/beginContext";

type TComplete = (content: string) => Promise<string>;

const SCHEDULED_DELAY = 1_000;

const METHOD_NAME = "function.target.session";

const sessionInternal = beginContext(
  (clientId: string, swarmName: SwarmName) => {
    const executionId = randomString();
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        swarmName,
        executionId,
      });
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    swarm.sessionValidationService.addSession(clientId, swarmName, "session");

    const complete = queued(async (content: string) => {
      swarm.sessionValidationService.validate(clientId, METHOD_NAME);
      return ExecutionContextService.runInContext(
        async () => {
          let isFinished = false;
          swarm.perfService.startExecution(
            executionId,
            clientId,
            content.length
          );
          try {
            swarm.busService.commitExecutionBegin(clientId, {
              swarmName,
            });
            const result = await swarm.sessionPublicService.execute(
              content,
              "user",
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
    });

    return {
      /**
       * Completes the session with the given content.
       *
       * @param {string} content - The content to complete the session with.
       * @returns {Promise<string>} A promise that resolves with the result of the session execution.
       */
      complete: beginContext(complete) as TComplete,

      /**
       * Disposes of the session.
       *
       * @returns {Promise<void>} A promise that resolves when the session is disposed.
       */
      dispose: beginContext(async () => {
        return await disposeConnection(clientId, swarmName, METHOD_NAME);
      }),
    };
  }
);

/**
 * Creates a session for the given client and swarm.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {Object} An object containing the session methods.
 * @returns {TComplete} complete - A function to complete the session with content.
 * @returns {Function} dispose - A function to dispose of the session.
 */
const session = (clientId: string, swarmName: SwarmName) =>
  sessionInternal(clientId, swarmName);

/**
 * Configuration options for a scheduled session.
 *
 * @interface ISessionConfig
 * @property {number} [delay] - The delay for the scheduled session in milliseconds.
 */
export interface ISessionConfig {
  delay?: number;
}

/**
 * Creates a scheduled session for the given client and swarm.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @param {Partial<ISessionConfig>} [config] - The configuration for the scheduled session.
 * @param {number} [config.delay] - The delay for the scheduled session.
 * @returns {Object} An object containing the scheduled session methods.
 * @returns {TComplete} complete - A function to complete the session with content.
 * @returns {Function} dispose - A function to dispose of the session.
 */
session.scheduled = (
  clientId: string,
  swarmName: SwarmName,
  { delay = SCHEDULED_DELAY }: Partial<ISessionConfig> = {}
) => {
  const { complete, dispose } = session(clientId, swarmName);

  let isMounted = true;

  /**
   * Completes the scheduled session with the given content.
   *
   * @param {string} content - The content to complete the session with.
   * @returns {Promise<string>} A promise that resolves with the result of the session execution.
   */
  const wrappedComplete: typeof complete = schedule(
    beginContext(async (content: string) => {
      if (!isMounted) {
        return;
      }
      return await complete(content);
    }),
    {
      onSchedule: beginContext(async ([content]) => {
        if (!isMounted) {
          return;
        }
        await commitUserMessage(
          content,
          clientId,
          await getAgentName(clientId)
        );
      }),
      delay,
    }
  );

  return {
    /**
     * Completes the scheduled session with the given content.
     *
     * @param {string} content - The content to complete the session with.
     * @returns {Promise<string>} A promise that resolves with the result of the session execution.
     */
    async complete(content: string) {
      return await wrappedComplete(content);
    },
    /**
     * Disposes of the scheduled session.
     *
     * @returns {Promise<void>} A promise that resolves when the session is disposed.
     */
    async dispose() {
      isMounted = false;
      return await dispose();
    },
  };
};

/**
 * A rate-limited connection factory for a client to a swarm and returns a function to send messages.
 *
 * @param {string} clientId - The unique identifier of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @param {Partial<ISessionConfig>} [config] - The configuration for rate limiting.
 * @param {number} [config.delay=SCHEDULED_DELAY] - The delay in milliseconds for rate limiting messages.
 */
session.rate = (
  clientId: string,
  swarmName: SwarmName,
  { delay = SCHEDULED_DELAY }: Partial<ISessionConfig> = {}
) => {
  const { complete, dispose } = session(clientId, swarmName);

  let isMounted = true;

  /**
   * Completes the scheduled session with the given content.
   *
   * @param {string} content - The content to complete the session with.
   * @returns {Promise<string>} A promise that resolves with the result of the session execution.
   */
  const wrappedComplete: typeof complete = rate(
    beginContext(async (content: string) => {
      if (!isMounted) {
        return;
      }
      return await complete(content);
    }),
    {
      key: () => clientId,
      rateName: `makeConnection.rate clientId=${clientId}`,
      delay,
    }
  );

  return {
    /**
     * Completes the scheduled session with the given content.
     *
     * @param {string} content - The content to complete the session with.
     * @returns {Promise<string>} A promise that resolves with the result of the session execution.
     */
    async complete(content: string) {
      try {
        return await wrappedComplete(content);
      } catch (error) {
        if (error?.type === "rate-error") {
          console.warn(
            `agent-swarm session.rate rate limit reached for clientId=${clientId}`
          );
          return "";
        }
        throw error;
      }
    },
    /**
     * Disposes of the scheduled session.
     *
     * @returns {Promise<void>} A promise that resolves when the session is disposed.
     */
    async dispose() {
      isMounted = false;
      return await dispose();
    },
  };
};

export { session };
