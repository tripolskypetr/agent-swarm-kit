import {
  ReceiveMessageFn,
  SendMessageFn,
} from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

export const makeConnection = (
  connector: SendMessageFn,
  clientId: string,
  swarmName: SwarmName
): ReceiveMessageFn => {
  swarm.swarmValidationService.validate(swarmName);
  swarm.sessionValidationService.addSession(clientId, swarmName);
  return swarm.sessionPublicService.connect(connector, clientId, swarmName);
};
