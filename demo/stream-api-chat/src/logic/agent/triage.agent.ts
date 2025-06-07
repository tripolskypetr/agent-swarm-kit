import { addAgent } from "agent-swarm-kit";
import { AgentName } from "../enum/AgentName";
import { CompletionName } from "../enum/CompletionName";
import { str } from "functools-kit";

addAgent({
  docDescription: "This agent functions as a pharmaceutical seller within the langchain-stream project, providing real-time consultations on pharma products using the CohereCompletion, which streams pending tokens via LangChain alongside Ollama and LMStudio completions, and it employs the AddToCartTool only when necessary to facilitate purchases.",
  agentName: AgentName.TriageAgent,
  completion: CompletionName.GrokMiniStreamCompletion,
  prompt: str.newline(
    "You are the pharma seller agent.",
    "Provide me the consultation about the pharma product"
  ),
  dependsOn: [],
});
