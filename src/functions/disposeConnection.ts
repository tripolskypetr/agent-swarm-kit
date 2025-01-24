import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

export const disposeConnection = async (
  clientId: string,
  swarmName: SwarmName
) => {
  swarm.sessionValidationService.validate(clientId);
  swarm.swarmValidationService.validate(swarmName);
  swarm.sessionValidationService.removeSession(clientId);
  await swarm.sessionPublicService.dispose(clientId, swarmName);
  await swarm.swarmPublicService.dispose(clientId, swarmName);
  await Promise.all([
    swarm.swarmValidationService
      .getAgentList(swarmName)
      .map(async (agentName) => {
        await swarm.agentPublicService.dispose(clientId, agentName);
        await swarm.historyPublicService.dispose(clientId, agentName);
      }),
  ]);
};
