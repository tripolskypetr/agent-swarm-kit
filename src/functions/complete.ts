import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import { disposeConnection } from "./disposeConnection";

export const complete = async (content: string, clientId: string, swarmName: SwarmName) => {
    swarm.swarmValidationService.validate(swarmName);
    swarm.sessionValidationService.addSession(clientId, swarmName);
    const result = await swarm.sessionPublicService.execute(content, clientId, swarmName);
    await disposeConnection(clientId, swarmName);
    return result;
};
