import { addSwarm } from "agent-swarm-kit";
import { SwarmName } from "../enum/SwarmName";
import { AgentName } from "../enum/AgentName";

addSwarm({
  docDescription: "This swarm serves as the root structure for the langchain-stream project, managing a single TriageAgent as both the sole member and default agent to handle pharmaceutical sales interactions, utilizing the CohereCompletion with LangChain to stream pending tokens in real-time alongside Ollama and LMStudio completions for efficient, responsive user consultations and cart operations.",
  swarmName: SwarmName.RootSwarm,
  agentList: [AgentName.TriageAgent],
  defaultAgent: AgentName.TriageAgent,
});