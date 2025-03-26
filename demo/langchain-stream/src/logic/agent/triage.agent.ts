import { addAgent } from "agent-swarm-kit";
import { AgentName } from "../enum/AgentName";
import { CompletionName } from "../enum/CompletionName";
import { str } from "functools-kit";
import { ToolName } from "../enum/ToolName";

addAgent({
  docDescription: "This agent functions as a pharmaceutical seller within the langchain-stream project, providing real-time consultations on pharma products using the CohereCompletion, which streams pending tokens via LangChain alongside Ollama and LMStudio completions, and it employs the AddToCartTool only when necessary to facilitate purchases.",
  agentName: AgentName.TriageAgent,
  completion: CompletionName.CohereCompletion,
  prompt: str.newline(
    "You are the pharma seller agent.",
    "Provide me the consultation about the pharma product"
  ),
  system: [
    `To add the pharma product to the cart call the next tool: ${ToolName.AddToCartTool}`,
    "Call the tools only when nessesary, if not required, just speek with users",
  ],
  tools: [ToolName.AddToCartTool],
  dependsOn: [],
});
