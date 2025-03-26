import { addSwarm } from "agent-swarm-kit";
import { SwarmName } from "../enum/SwarmName";
import { AgentName } from "../enum/AgentName";

addSwarm({
  docDescription: "This swarm acts as the root structure for the cohere-token-rotation project, managing a single TriageAgent as both the sole member and default agent to handle pharmaceutical sales interactions, leveraging the CohereCompletion with a token rotation mechanism utilizing 10 trial tokens in parallel to optimize API performance for user consultations and cart operations.",
  swarmName: SwarmName.RootSwarm,
  agentList: [AgentName.TriageAgent],
  defaultAgent: AgentName.TriageAgent,
});
