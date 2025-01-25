import { queued } from "functools-kit";
import {
  ReceiveMessageFn,
  SendMessageFn,
} from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

export const makeConnection = (
  connector: ReceiveMessageFn,
  clientId: string,
  swarmName: SwarmName
): SendMessageFn => {
  swarm.swarmValidationService.validate(swarmName, "makeConnection");
  swarm.sessionValidationService.addSession(clientId, swarmName);
  const send = swarm.sessionPublicService.connect(
    connector,
    clientId,
    swarmName
  );
  return queued(async (outgoing) => {
    swarm.sessionValidationService.validate(clientId, "makeConnection");
    return await send(outgoing);
  }) as SendMessageFn;
};
