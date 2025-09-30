import { queued, rate, schedule, singlerun } from "functools-kit";
import { GLOBAL_CONFIG } from "../../config/params";
import { ReceiveMessageFn } from "../../interfaces/Session.interface";
import { SwarmName } from "../../interfaces/Swarm.interface";
import swarm from "../../lib";
import beginContext from "../../utils/beginContext";
import PayloadContextService from "../../lib/services/context/PayloadContextService";
import { markOnline } from "../other/markOnline";

/**
 * Type definition for the send message function returned by connection factories.
*/
type SendMessageFn = (outgoing: string) => Promise<void>;

/**
 * Delay in milliseconds for scheduled message sending.
 * @constant {number}
*/
const SCHEDULED_DELAY = 1_000;

/**
 * Delay in milliseconds for rate-limited message sending.
 * @constant {number}
*/
const RATE_DELAY = 10_000;

const METHOD_NAME = "function.target.makeConnection";

/**
 * Internal implementation of the connection factory for a client to a swarm.
 *
 * Creates a queued connection to the swarm session, validating the swarm and initializing the session in "makeConnection" mode.
 * Returns a function to send messages, wrapped in `beginContext` for isolated execution.
 *
*/
const makeConnectionInternal = (
  connector: ReceiveMessageFn,
  clientId: string,
  swarmName: SwarmName
): SendMessageFn => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
      swarmName,
    });

  // Validate the swarm and initialize the session
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  swarm.sessionValidationService.addSession(
    clientId,
    swarmName,
    "makeConnection"
  );

  // Create a queued send function using the session public service
  const send = queued(
    swarm.sessionPublicService.connect(
      connector,
      METHOD_NAME,
      clientId,
      swarmName
    )
  );

  // Return a wrapped send function with validation and agent context
  return (async (outgoing) => {
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    return await send({
      data: outgoing,
      agentName: await swarm.swarmPublicService.getAgentName(
        METHOD_NAME,
        clientId,
        swarmName
      ),
      clientId,
    });
  }) as unknown as SendMessageFn;
};

/**
 * A connection factory for establishing a client connection to a swarm, returning a function to send messages.
 *
 * This factory creates a queued connection to the swarm, allowing the client to send messages to the active agent.
 * It is designed for real-time communication, leveraging the session public service for message handling.
 *
 * @throws {Error} If swarm or session validation fails, or if the connection process encounters an error.
 * @example
 * const sendMessage = makeConnection((msg) => console.log(msg), "client-123", "TaskSwarm");
 * await sendMessage("Hello, swarm!");
*/
const makeConnection = <Payload extends object = object>(
  connector: ReceiveMessageFn,
  clientId: string,
  swarmName: SwarmName
) => {
  const send = makeConnectionInternal(connector, clientId, swarmName);

  const online = singlerun(async () => {
    await markOnline(clientId, swarmName);
  });

  online();

  return beginContext(
    async (content: string, payload: Payload = null as Payload) => {
      await online();
      if (payload) {
        return await PayloadContextService.runInContext(
          async () => {
            return await send(content);
          },
          {
            clientId,
            payload,
          }
        );
      }
      return await send(content);
    }
  );
};

/**
 * Configuration interface for scheduling or rate-limiting messages.
*/
export interface IMakeConnectionConfig {
  /**
   * The delay in milliseconds for scheduling or rate-limiting messages.
   * Controls the timing interval for scheduled or rate-limited message sending operations.
  */
  delay?: number;
}

/**
 * A scheduled connection factory for a client to a swarm, returning a function to send delayed messages.
 *
 * This factory extends `makeConnection` by adding scheduling capabilities, delaying message sends based on the configured delay.
 * It commits messages to the agent's history immediately via `commitUserMessage` and sends them after the delay if the session remains active.
 *
 * @throws {Error} If swarm or session validation fails, or if the scheduled send process encounters an error.
 * @example
 * const sendScheduled = makeConnection.scheduled((msg) => console.log(msg), "client-123", "TaskSwarm", { delay: 2000 });
 * await sendScheduled("Delayed message"); // Sent after 2 seconds
*/
makeConnection.scheduled = <Payload extends object = object>(
  connector: ReceiveMessageFn,
  clientId: string,
  swarmName: SwarmName,
  { delay = SCHEDULED_DELAY }: Partial<IMakeConnectionConfig> = {}
) => {
  const send = makeConnectionInternal(connector, clientId, swarmName);

  const online = singlerun(async () => {
    await markOnline(clientId, swarmName);
  });

  online();

  const wrappedSend = schedule(
    beginContext(async (content: string, payload: Payload) => {
      if (!swarm.sessionValidationService.hasSession(clientId)) {
        return;
      }
      await online();
      if (payload) {
        return await PayloadContextService.runInContext(
          async () => {
            return await send(content);
          },
          {
            clientId,
            payload,
          }
        );
      }
      return await send(content);
    }),
    {
      onSchedule: beginContext(async ([content, payload]) => {
        if (!swarm.sessionValidationService.hasSession(clientId)) {
          return;
        }
        await online();
        if (payload) {
          return await PayloadContextService.runInContext(
            async () => {
              await swarm.sessionPublicService.commitUserMessage(
                content,
                "user",
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
        await swarm.sessionPublicService.commitUserMessage(
          content,
          "user",
          METHOD_NAME,
          clientId,
          swarmName
        );
      }),
      delay,
    }
  );

  return async (content: string, payload: Payload = null as Payload) => {
    return await wrappedSend(content, payload);
  };
};

/**
 * A rate-limited connection factory for a client to a swarm, returning a function to send throttled messages.
 *
 * This factory extends `makeConnection` by adding rate-limiting capabilities, throttling message sends based on the configured delay.
 * If the rate limit is exceeded, it warns and returns an empty result instead of throwing an error.
 *
 * @throws {Error} If swarm or session validation fails, or if the send process encounters a non-rate-limit error.
 * @example
 * const sendRateLimited = makeConnection.rate((msg) => console.log(msg), "client-123", "TaskSwarm", { delay: 5000 });
 * await sendRateLimited("Throttled message"); // Limited to one send every 5 seconds
*/
makeConnection.rate = <Payload extends object = object>(
  connector: ReceiveMessageFn,
  clientId: string,
  swarmName: SwarmName,
  { delay = RATE_DELAY }: Partial<IMakeConnectionConfig> = {}
) => {
  const send = makeConnectionInternal(connector, clientId, swarmName);

  const online = singlerun(async () => {
    await markOnline(clientId, swarmName);
  });

  online();

  const wrappedSend = rate(
    beginContext(async (content: string, payload: Payload) => {
      if (!swarm.sessionValidationService.hasSession(clientId)) {
        return;
      }
      await online();
      if (payload) {
        return await PayloadContextService.runInContext(
          async () => {
            return await send(content);
          },
          {
            clientId,
            payload,
          }
        );
      }
      return await send(content);
    }),
    {
      key: () => clientId,
      rateName: `makeConnection.rate clientId=${clientId}`,
      delay,
    }
  );

  return async (content: string, payload: Payload = null as Payload) => {
    try {
      return await wrappedSend(content, payload);
    } catch (error) {
      if (error?.type === "rate-error") {
        console.warn(
          `agent-swarm makeConnection.rate rate limit reached for clientId=${clientId}`
        );
        return "";
      }
      throw error;
    }
  };
};

export { makeConnection };
