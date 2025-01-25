import { queued, singleshot, ttl } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

const CHANGE_AGENT_TTL = 15 * 60 * 1_000;
const CHANGE_AGENT_GC = 60 * 1_000;

type TChangeAgentRun = (agentName: string) => Promise<void>;

const createChangeAgent = ttl(
  (clientId: string) =>
    queued(async (agentName: AgentName) => {
      swarm.sessionValidationService.validate(clientId, "changeAgent");
      swarm.agentValidationService.validate(agentName, "changeAgent");
      const swarmName = swarm.sessionValidationService.getSwarm(clientId);
      await swarm.agentPublicService.dispose(clientId, agentName);
      await swarm.historyPublicService.dispose(clientId, agentName);
      await swarm.swarmPublicService.setAgentRef(
        clientId,
        swarmName,
        agentName,
        await swarm.agentPublicService.createAgentRef(clientId, agentName)
      );
      await swarm.swarmPublicService.setAgentName(agentName, clientId, swarmName);
    }) as TChangeAgentRun,
  {
    key: ([clientId]) => `${clientId}`,
    timeout: CHANGE_AGENT_TTL,
  }
);

const createGc = singleshot(async () => {
  setInterval(createChangeAgent.gc, CHANGE_AGENT_GC);
});

export const changeAgent = async (agentName: AgentName, clientId: string) => {
  const run = await createChangeAgent(clientId);
  createGc();
  return await run(agentName);
};
