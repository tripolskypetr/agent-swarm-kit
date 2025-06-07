import { addAgent } from "agent-swarm-kit";
import { AgentName } from "../enum/AgentName";
import { CompletionName } from "../enum/CompletionName";
import { str } from "functools-kit";

addAgent({
  docDescription: "This agent operates within a web server project that implements an OpenAI-compatible AI API with token streaming, designed for integration with the GPT4All desktop app. It functions as a pharmaceutical seller, providing real-time consultations on pharmaceutical products using the GrokMiniStreamCompletion for streaming responses. The agent leverages the AddToCartTool to facilitate purchases when necessary.",
  agentName: AgentName.TriageAgent,
  completion: CompletionName.GrokMiniStreamCompletion,
  prompt: str.newline(
    "You are the pharma seller agent.",
    "Provide me the consultation about the pharma product"
  ),
  dependsOn: [],
});
