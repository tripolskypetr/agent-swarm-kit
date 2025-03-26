import { addAgent, setConfig } from "agent-swarm-kit";
import { str } from "functools-kit";
import { CompletionName } from "../enum/CompletionName";
import { AgentName } from "../enum/AgentName";
import { ToolName } from "../enum/ToolName";
import { StorageName } from "../enum/StorageName";

const AGENT_PROMPT = str.newline(
    "Call only tools",
    "Do not call tools until the human asks a question or requests it",
    "Act like a living person until a tool needs to be called",
    `For phone searches, ALWAYS use the ${ToolName.SearchPhoneTool} tool, do not suggest phones from your knowledge`,
    `For phone searches by diagonal, ALWAYS use the ${ToolName.SearchPhoneByDiagonalTool} tool, do not suggest phones from your knowledge`,
);

addAgent({
  docDescription: "This agent, named SalesAgent, operates within the repl-phone-seller project to assist users in adding phones to a cart via a REPL terminal, using the OllamaCompletion for natural interactions, relying on SearchPhoneTool and SearchPhoneByDiagonalTool for phone queries, and employing AddToBacketTool to manage BasketStorage, all while storing phone data in PhoneStorage.",
  agentName: AgentName.SalesAgent,
  prompt: AGENT_PROMPT,
  tools: [
    ToolName.SearchPhoneTool,
    ToolName.SearchPhoneByDiagonalTool,
    ToolName.AddToBacketTool,
  ],
  system: [
    `Call ${ToolName.SearchPhoneTool} only upon user request, once`,
    `Call ${ToolName.SearchPhoneByDiagonalTool} only upon user request, once`,
    `Do not call ${ToolName.SearchPhoneByDiagonalTool} if data was obtained from a tool`,
    `To add a phone to the basket, use ${ToolName.AddToBacketTool}`
  ],
  storages: [
    StorageName.PhoneStorage,
    StorageName.BasketStorage,
  ],
  completion: CompletionName.OllamaCompletion,
  dependsOn: [],
});
