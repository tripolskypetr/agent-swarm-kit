import { addAgent, State } from "agent-swarm-kit";
import { AgentName } from "../../enum/AgentName";
import { CompletionName } from "../../enum/CompletionName";
import { ToolName } from "../../enum/ToolName";
import { StateName } from "../../enum/StateName";
import { StorageName } from "../../enum/StorageName";

addAgent({
  docDescription: "This agent serves as a triage agent within the redis-persist-chat project, engaging in customer chats using the SaigaYandexGPTCompletion, persisting chat history and agent state like TicTacToeState in Redis, and invoking TestStateTool or TestStorageTool only when requested to test state or storage functionalities stored in FactStorage.",
  agentName: AgentName.TriageAgent,
  completion: CompletionName.SaigaYandexGPTCompletion,
  prompt: "You are a triage agent of a swarm system. Just chat with customer",
  system: [
    `Only when user ask you to test state call the ${ToolName.TestStateTool}`,
    `Only when user ask you to test storage call the ${ToolName.TestStorageTool}`,
  ],
  tools: [
    ToolName.TestStateTool,
    ToolName.TestStorageTool,
  ],
  states: [
    StateName.TicTacToeState,
  ],
  storages: [
    StorageName.FactStorage,
  ],
  dependsOn: [],
});