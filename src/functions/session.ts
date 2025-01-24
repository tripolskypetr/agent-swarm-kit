import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import { disposeConnection } from "./disposeConnection";

export const session = (clientId: string, swarmName: SwarmName) => {
    swarm.swarmValidationService.validate(swarmName);
    swarm.sessionValidationService.addSession(clientId, swarmName);
    return {
        complete: async (content: string) => {
            swarm.sessionValidationService.validate(clientId);
            return await swarm.sessionPublicService.execute(content, clientId, swarmName);
        },
        dispose: async () => {
            swarm.sessionValidationService.validate(clientId);
            return await disposeConnection(clientId, swarmName);
        },
    }
};
