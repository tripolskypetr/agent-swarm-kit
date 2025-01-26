import { queued } from "functools-kit";
import { ReceiveMessageFn } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

type SendMessageFn = (outgoing: string) => Promise<void>;

/**
 * A connection factory for a client to a swarm and returns a function to send messages.
 *
 * @param {ReceiveMessageFn} connector - The function to receive messages.
 * @param {string} clientId - The unique identifier of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {SendMessageFn} - A function to send messages to the swarm.
 */
export const makeConnection = (
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
