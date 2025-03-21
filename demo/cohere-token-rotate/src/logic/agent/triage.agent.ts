import { addAgent } from "agent-swarm-kit";
import { AgentName } from "../enum/AgentName";
import { CompletionName } from "../enum/CompletionName";
import { str } from "functools-kit";
import { ToolName } from "../enum/ToolName";

addAgent({
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
});
