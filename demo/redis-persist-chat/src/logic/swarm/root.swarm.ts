import { addSwarm, Policy } from "agent-swarm-kit";
import { SwarmName } from "../../enum/SwarmName";
import { AgentName } from "../../enum/AgentName";
import { PolicyName } from "../../enum/PolicyName";

addSwarm({
  swarmName: SwarmName.RootSwarm,
  agentList: [AgentName.TriageAgent],
  defaultAgent: AgentName.TriageAgent,
  policies: [PolicyName.CrimeaPolicy, PolicyName.PutinPolicy],
});
