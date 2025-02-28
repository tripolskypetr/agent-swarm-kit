import { queued, schedule } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import { ReceiveMessageFn } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import { commitUserMessage } from "./commitUserMessage";
import { getAgentName } from "./getAgentName";

type SendMessageFn = (outgoing: string) => Promise<void>;

const SCHEDULED_DELAY = 1_000;

const METHOD_NAME = "function.makeConnection";

/**
 * A connection factory for a client to a swarm and returns a function to send messages.
 *
 * @param {ReceiveMessageFn} connector - The function to receive messages.
 * @param {string} clientId - The unique identifier of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {SendMessageFn} - A function to send messages to the swarm.
 */
const makeConnection = (
  connector: ReceiveMessageFn,
  clientId: string,
  swarmName: SwarmName
): SendMessageFn => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
      swarmName,
    });
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  swarm.sessionValidationService.addSession(
    clientId,
    swarmName,
    "makeConnection"
  );
  const send = swarm.sessionPublicService.connect(
    connector,
    METHOD_NAME,
    clientId,
    swarmName
  );
  return queued(async (outgoing) => {
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
  }) as SendMessageFn;
};

/**
 * Configuration for scheduling messages.
 *
 * @interface IMakeConnectionConfig
 * @property {number} [delay] - The delay in milliseconds for scheduling messages.
 */
export interface IMakeConnectionConfig {
  delay?: number;
}

/**
 * A scheduled connection factory for a client to a swarm and returns a function to send messages.
 *
 * @param {ReceiveMessageFn} connector - The function to receive messages.
 * @param {string} clientId - The unique identifier of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @param {Partial<IMakeConnectionConfig>} [config] - The configuration for scheduling.
 * @returns {SendMessageFn} - A function to send scheduled messages to the swarm.
 */
makeConnection.scheduled = (
  connector: ReceiveMessageFn,
  clientId: string,
  swarmName: SwarmName,
  { delay = SCHEDULED_DELAY }: Partial<IMakeConnectionConfig> = {}
) => {
  const send = makeConnection(connector, clientId, swarmName);

  /**
   * A wrapped send function that schedules the message sending.
   *
   * @param {string} content - The message content to be sent.
   * @returns {Promise<void>} - A promise that resolves when the message is sent.
   */
  const wrappedSend: typeof send = schedule(
    async (content: string) => {
      if (!swarm.sessionValidationService.hasSession(clientId)) {
        return;
      }
      return await send(content);
    },
    {
      /**
       * A function that is called when a message is scheduled.
       *
       * @param {[string]} content - The message content to be scheduled.
       * @returns {Promise<void>} - A promise that resolves when the message is committed.
       */
      onSchedule: async ([content]) => {
        if (!swarm.sessionValidationService.hasSession(clientId)) {
          return;
        }
        await commitUserMessage(
          content,
          clientId,
          await getAgentName(clientId)
        );
      },
      /**
       * The delay for message scheduler
       */
      delay,
    }
  );

  /**
   * A function to send scheduled messages.
   *
   * @param {string} content - The message content to be sent.
   * @returns {Promise<void>} - A promise that resolves when the message is sent.
   */
  return async (content: string) => {
    return await wrappedSend(content);
  };
};

export { makeConnection };
