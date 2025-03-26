import { addSwarm, Policy } from "agent-swarm-kit";
import { SwarmName } from "../../enum/SwarmName";
import { AgentName } from "../../enum/AgentName";
import { PolicyName } from "../../enum/PolicyName";

addSwarm({
  docDescription: "This swarm serves as the root structure for the persist-redis-storage project, managing a single TriageAgent as both the sole member and default agent to handle customer chats using the SaigaYandexGPTCompletion, persisting chat history and states in Redis, while enforcing CrimeaPolicy and PutinPolicy to restrict discussions on sensitive topics.",
  swarmName: SwarmName.RootSwarm,
  agentList: [AgentName.TriageAgent],
  defaultAgent: AgentName.TriageAgent,
  policies: [PolicyName.CrimeaPolicy, PolicyName.PutinPolicy],
});