import {
  ReceiveMessageFn,
  SendMessageFn,
} from "src/interfaces/Session.interface";
import { SwarmName } from "src/interfaces/Swarm.interface";
import swarm from "src/lib";

export const makeConnection = (
  connector: SendMessageFn,
  clientId: string,
  swarmName: SwarmName
): ReceiveMessageFn => {
  swarm.swarmValidationService.validate(swarmName);
  swarm.sessionValidationService.addSession(clientId, swarmName);
  return swarm.sessionPublicService.connect(connector, clientId, swarmName);
};
