import { addTool, changeToDefaultAgent, commitToolOutput, executeForce } from "agent-swarm-kit";

export const NAVIGATE_TO_TRIAGE = addTool({
  docNote: "This tool, named navigate_to_triage_tool, facilitates navigation within the telegram-ollama-chat project by redirecting the user from the current agent to the default triage agent via Telegram, REPL, or webview, confirming the switch with a success message, logging the action, and forcing a greeting from the triage agent.",
  toolName: "navigate_to_triage_tool",
  call: async ({ toolId, clientId, agentName }) => {
    console.log(NAVIGATE_TO_TRIAGE);
    await commitToolOutput(toolId, "Navigation success", clientId, agentName);
    await changeToDefaultAgent(clientId);
    await executeForce("Say hello to the user", clientId);
  },
  type: "function",
  function: {
    name: "navigate_to_triage_tool",
    description: "Navigate to triage agent",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
});
