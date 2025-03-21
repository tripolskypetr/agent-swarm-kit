import { addSwarm } from "agent-swarm-kit";
import { SwarmName } from "../enum/SwarmName";
import { AgentName } from "../enum/AgentName";

addSwarm({
  swarmName: SwarmName.RootSwarm,
  agentList: [AgentName.TriageAgent],
  defaultAgent: AgentName.TriageAgent,
});
