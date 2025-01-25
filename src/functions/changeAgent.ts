import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

export const changeAgent = async (agentName: AgentName, clientId: string) => {
  swarm.sessionValidationService.validate(clientId, "changeAgent");
  swarm.agentValidationService.validate(agentName, "changeAgent");
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  const currentAgentName = await swarm.swarmPublicService.getAgentName(
    clientId,
    swarmName
  );
  if (agentName === currentAgentName) {
    return;
  }
  await swarm.agentPublicService.dispose(clientId, agentName);
  await swarm.historyPublicService.dispose(clientId, agentName);
  await swarm.swarmPublicService.setAgentRef(
    clientId,
    swarmName,
    agentName,
    await swarm.agentPublicService.createAgentRef(clientId, agentName)
  );
  await swarm.swarmPublicService.setAgentName(agentName, clientId, swarmName);
};
