import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

export const emit = async (
  content: string,
  clientId: string,
  agentName: AgentName
) => {
  swarm.loggerService.log("function emit", {
    content,
    clientId,
    agentName,
  });
  if (swarm.sessionValidationService.getSessionMode(clientId) !== "makeConnection") {
    throw new Error(`agent-swarm-kit emit session is not makeConnection clientId=${clientId}`);
  }
  swarm.agentValidationService.validate(agentName, "execute");
  swarm.sessionValidationService.validate(clientId, "execute");
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, "execute");
  const currentAgentName = await swarm.swarmPublicService.getAgentName(
    clientId,
    swarmName
  );
  if (currentAgentName !== agentName) {
    swarm.loggerService.log(
      'function "emit" skipped due to the agent change',
      {
        currentAgentName,
        agentName,
        clientId,
      }
    );
    return;
  }
  return await swarm.sessionPublicService.emit(content, clientId, swarmName);
};
