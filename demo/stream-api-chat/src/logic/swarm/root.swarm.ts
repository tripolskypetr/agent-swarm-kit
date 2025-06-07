import { addSwarm } from "agent-swarm-kit";
import { SwarmName } from "../enum/SwarmName";
import { AgentName } from "../enum/AgentName";

addSwarm({
  docDescription: "This swarm serves as the root structure for a web server project implementing an OpenAI-compatible AI API with token streaming, designed for integration with the GPT4All desktop app. It manages a single TriageAgent as both the sole member and default agent to handle pharmaceutical sales interactions, utilizing the GrokMiniStreamCompletion to stream responses in real-time for efficient and responsive user consultations and cart operations.",
  swarmName: SwarmName.RootSwarm,
  agentList: [AgentName.TriageAgent],
  defaultAgent: AgentName.TriageAgent,
});