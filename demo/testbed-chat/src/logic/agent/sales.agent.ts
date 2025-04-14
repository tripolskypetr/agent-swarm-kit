import { addAgent, setConfig } from "agent-swarm-kit";
import { str } from "functools-kit";
import { CompletionName } from "../enum/CompletionName";
import { AgentName } from "../enum/AgentName";
import { ToolName } from "../enum/ToolName";

const AGENT_PROMPT = str.newline(
  "Call only tools",
  "Do not call tools until the human asks a question or requests it",
  "Act like a living person until a tool needs to be called"
);

addAgent({
  docDescription:
    "This agent, named SalesAgent, operates within the repl-phone-seller project to assist users in adding phones to a cart via a REPL terminal, using the OllamaCompletion for natural interactions, relying on SearchPhoneTool and SearchPhoneByDiagonalTool for phone queries, and employing AddToBacketTool to manage BasketStorage, all while storing phone data in PhoneStorage.",
  agentName: AgentName.SalesAgent,
  prompt: AGENT_PROMPT,
  tools: [ToolName.AddToBacketTool],
  system: [`To add a phone to the basket, use ${ToolName.AddToBacketTool}`],
  completion: CompletionName.OpenaiCompletion,
  dependsOn: [],
});
