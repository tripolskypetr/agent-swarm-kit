import { addSwarm } from "agent-swarm-kit";
import { SwarmName } from "../enum/SwarmName";
import { AgentName } from "../enum/AgentName";

addSwarm({
  docDescription: "This swarm serves as the root structure for the HuggingFace Inference demo project, managing a single TriageAgent as both the sole member and default agent to handle pharmaceutical sales interactions, utilizing the HfCompletion powered by OpenAI's gpt-oss-120b model through HuggingFace's cost-effective inference cloud for efficient, responsive user consultations and cart operations.",
  swarmName: SwarmName.RootSwarm,
  agentList: [AgentName.TriageAgent],
  defaultAgent: AgentName.TriageAgent,
});