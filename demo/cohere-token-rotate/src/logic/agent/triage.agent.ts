import { addAgent } from "agent-swarm-kit";
import { AgentName } from "../enum/AgentName";
import { CompletionName } from "../enum/CompletionName";
import { str } from "functools-kit";
import { ToolName } from "../enum/ToolName";

addAgent({
  docDescription: "This agent serves as a pharmaceutical seller within a triage system, offering consultations on pharma products using the CohereCompletion powered by a Cohere API with a token rotation mechanism to leverage 10 trial tokens in parallel for enhanced performance, and it employs the AddToCartTool only when necessary to assist with purchases.",
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
