import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import { disposeConnection } from "./disposeConnection";

export const session = (clientId: string, swarmName: SwarmName) => {
    swarm.swarmValidationService.validate(swarmName);
    swarm.sessionValidationService.addSession(clientId, swarmName);
    return {
        complete: async (content: string) => await swarm.sessionPublicService.execute(content, clientId, swarmName),
        dispose: async () => await disposeConnection(clientId, swarmName),
    }
};
