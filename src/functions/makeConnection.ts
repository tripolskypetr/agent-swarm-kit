import { queued, schedule } from "functools-kit";
import { ReceiveMessageFn } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import { commitUserMessage } from "./commitUserMessage";
import { getAgentName } from "./getAgentName";

type SendMessageFn = (outgoing: string) => Promise<void>;

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
  swarm.loggerService.log("function makeConnection", {
    clientId,
    swarmName,
  });
  swarm.swarmValidationService.validate(swarmName, "makeConnection");
  swarm.sessionValidationService.addSession(clientId, swarmName, "makeConnection");
  const send = swarm.sessionPublicService.connect(
    connector,
    clientId,
    swarmName
  );
  return queued(async (outgoing) => {
    swarm.sessionValidationService.validate(clientId, "makeConnection");
    return await send({
      data: outgoing,
      agentName: await swarm.swarmPublicService.getAgentName(
        clientId,
        swarmName
      ),
      clientId,
    });
  }) as SendMessageFn;
};

/**
 * A scheduled connection factory for a client to a swarm and returns a function to send messages.
 *
 * @param {ReceiveMessageFn} connector - The function to receive messages.
 * @param {string} clientId - The unique identifier of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {SendMessageFn} - A function to send scheduled messages to the swarm.
 */
makeConnection.scheduled = (connector: ReceiveMessageFn, clientId: string, swarmName: SwarmName) => {
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

export { makeConnection }
