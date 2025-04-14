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
    "This agent, named SalesAgent, is designed for a testbed environment using worker-testbed and the WorkerThreads API with tape. It mocks tool calls to validate their execution, passing tests when the correct tool (e.g., AddToBacketTool) is called as requested and failing otherwise. It uses OpenAI for interaction, manages phone additions to BasketStorage via AddToBacketTool, and stores phone data in PhoneStorage.",
  agentName: AgentName.SalesAgent,
  prompt: AGENT_PROMPT,
  tools: [ToolName.AddToBacketTool],
  system: [`To add a phone to the basket, use ${ToolName.AddToBacketTool}`],
  completion: CompletionName.OpenaiCompletion,
  dependsOn: [],
});
