import { queued } from "functools-kit";
import { ReceiveMessageFn } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

type SendMessageFn = (outgoing: string) => Promise<void>;

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
  swarm.sessionValidationService.addSession(clientId, swarmName);
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
