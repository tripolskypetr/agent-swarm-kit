import {
  queued,
  randomString,
  rate,
  schedule,
  singleshot,
} from "functools-kit";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";
import swarm, { ExecutionContextService } from "../../lib";
import { disposeConnection } from "./disposeConnection";
import beginContext from "../../utils/beginContext";
import PayloadContextService from "../../lib/services/context/PayloadContextService";
import { markOnline } from "../other/markOnline";

/**
 * Type definition for the complete function used in session objects.
 * @typedef {Function} TComplete
 * @param {string} content - The content to process in the session.
 * @returns {Promise<string>} A promise that resolves with the result of the session execution.
 */
type TComplete = (content: string) => Promise<string>;

/**
 * Default delay in milliseconds for scheduled or rate-limited session completions.
 * @constant {number}
 */
const SCHEDULED_DELAY = 1_000;

const METHOD_NAME = "function.target.session";

/**
 * Internal implementation of the session factory for a client and swarm.
 *
 * Creates a session with queued execution capabilities, initializing it in "session" mode and providing methods to complete and dispose of the session.
 * The `complete` method executes content with performance tracking and event bus notifications, wrapped in an execution context.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm to connect to.
 * @returns {Object} An object containing `complete` and `dispose` methods for session management.
 */
const sessionInternal = (clientId: string, swarmName: SwarmName) => {
  const executionId = randomString();

  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
      swarmName,
      executionId,
    });

  // Validate the swarm and initialize the session
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  swarm.sessionValidationService.addSession(clientId, swarmName, "session");

  const complete = queued(async (content: string) => {
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    return ExecutionContextService.runInContext(
      async () => {
        let isFinished = false;
        swarm.perfService.startExecution(executionId, clientId, content.length);
        try {
          swarm.busService.commitExecutionBegin(clientId, { swarmName });
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
    complete: (async (content: string) => {
      return await complete(content);
    }) as TComplete,
    dispose: async () =>
      await disposeConnection(clientId, swarmName, METHOD_NAME),
  };
};

/**
 * Creates a session for a client and swarm, providing methods to complete and dispose of it.
 *
 * This factory establishes a session in "session" mode, allowing content execution with queuing for sequential processing.
 * It returns an object with `complete` to process content and `dispose` to clean up the session.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm to connect to.
 * @returns {{ complete: TComplete, dispose: () => Promise<void> }} An object with `complete` and `dispose` methods.
 * @throws {Error} If swarm or session validation fails, or if execution/disposal encounters an error.
 * @example
 * const { complete, dispose } = session("client-123", "TaskSwarm");
 * const result = await complete("Hello, swarm!");
 * console.log(result); // Outputs the swarm's response
 * await dispose();
 */
const session = <Payload extends object = object>(
  clientId: string,
  swarmName: SwarmName
) => {
  const { complete, dispose } = sessionInternal(clientId, swarmName);

  let isMounted = true;

  const online = singleshot(async () => {
    await markOnline(clientId, swarmName);
  });

  return {
    complete: beginContext(
      async (content: string, payload: Payload = null as Payload) => {
        if (!isMounted) {
          return;
        }
        await online();
        if (payload) {
          return await PayloadContextService.runInContext(
            async () => {
              return await complete(content);
            },
            {
              clientId,
              payload,
            }
          );
        }
        return await complete(content);
      }
    ),
    dispose: beginContext(async () => {
      isMounted = false;
      await dispose();
    }),
  };
};

/**
 * Configuration interface for scheduled or rate-limited sessions.
 *
 * @interface ISessionConfig
 * @property {number} [delay] - The delay in milliseconds for scheduling or rate-limiting session completions (optional).
 */
export interface ISessionConfig {
  delay?: number;
}

/**
 * Creates a scheduled session for a client and swarm, delaying content execution.
 *
 * This factory extends `session` by adding scheduling capabilities, delaying `complete` calls based on the configured delay.
 * It commits messages to the agent's history immediately via `commitUserMessage` and executes them after the delay if the session remains active.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm to connect to.
 * @param {Partial<ISessionConfig>} [config] - Configuration object with an optional delay (defaults to `SCHEDULED_DELAY`).
 * @returns {{ complete: TComplete, dispose: () => Promise<void> }} An object with scheduled `complete` and `dispose` methods.
 * @throws {Error} If swarm or session validation fails, or if execution/disposal encounters an error.
 * @example
 * const { complete, dispose } = session.scheduled("client-123", "TaskSwarm", { delay: 2000 });
 * const result = await complete("Delayed message"); // Executed after 2 seconds
 * console.log(result);
 * await dispose();
 */
session.scheduled = <Payload extends object = object>(
  clientId: string,
  swarmName: SwarmName,
  { delay = SCHEDULED_DELAY }: Partial<ISessionConfig> = {}
) => {
  const { complete, dispose } = sessionInternal(clientId, swarmName);
  let isMounted = true;

  const online = singleshot(async () => {
    await markOnline(clientId, swarmName);
  });

  const wrappedComplete = schedule(
    beginContext(async (content: string, payload: Payload) => {
      if (!isMounted) {
        return;
      }
      await online();
      if (payload) {
        return await PayloadContextService.runInContext(
          async () => {
            return await complete(content);
          },
          {
            clientId,
            payload,
          }
        );
      }
      return await complete(content);
    }),
    {
      onSchedule: beginContext(async ([content, payload]) => {
        if (!isMounted) {
          return;
        }
        await online();
        if (payload) {
          return await PayloadContextService.runInContext(
            async () => {
              return await swarm.sessionPublicService.commitUserMessage(
                content,
                METHOD_NAME,
                clientId,
                swarmName
              );
            },
            {
              clientId,
              payload,
            }
          );
        }
        return await swarm.sessionPublicService.commitUserMessage(
          content,
          METHOD_NAME,
          clientId,
          swarmName
        );
      }),
      delay,
    }
  );

  return {
    complete: async (content: string, payload: Payload = null as Payload) => {
      return await wrappedComplete(content, payload);
    },
    dispose: beginContext(async () => {
      isMounted = false;
      return await dispose();
    }),
  };
};

/**
 * Creates a rate-limited session for a client and swarm, throttling content execution.
 *
 * This factory extends `session` by adding rate-limiting capabilities, throttling `complete` calls based on the configured delay.
 * If the rate limit is exceeded, it warns and returns an empty string instead of throwing an error.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm to connect to.
 * @param {Partial<ISessionConfig>} [config] - Configuration object with an optional delay (defaults to `SCHEDULED_DELAY`).
 * @returns {{ complete: TComplete, dispose: () => Promise<void> }} An object with rate-limited `complete` and `dispose` methods.
 * @throws {Error} If swarm or session validation fails, or if execution/disposal encounters a non-rate-limit error.
 * @example
 * const { complete, dispose } = session.rate("client-123", "TaskSwarm", { delay: 5000 });
 * const result = await complete("Throttled message"); // Limited to one execution every 5 seconds
 * console.log(result);
 * await dispose();
 */
session.rate = <Payload extends object = object>(
  clientId: string,
  swarmName: SwarmName,
  { delay = SCHEDULED_DELAY }: Partial<ISessionConfig> = {}
) => {
  const { complete, dispose } = sessionInternal(clientId, swarmName);
  let isMounted = true;

  const online = singleshot(async () => {
    await markOnline(clientId, swarmName);
  });

  const wrappedComplete = rate(
    beginContext(async (content: string, payload: Payload) => {
      if (!isMounted) {
        return;
      }
      await online();
      if (payload) {
        return await PayloadContextService.runInContext(
          async () => {
            return await complete(content);
          },
          {
            clientId,
            payload,
          }
        );
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
    async complete(content: string, payload: Payload = null as Payload) {
      try {
        return await wrappedComplete(content, payload);
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
    dispose: beginContext(async () => {
      isMounted = false;
      return await dispose();
    }),
  };
};

export { session };
