import {
  addTool,
  changeToAgent,
  commitToolOutput,
  execute,
} from "agent-swarm-kit";
import { SALES_AGENT } from "../../agent/sales.agent";

export const NAVIGATE_TO_SALES = addTool({
  docNote: "This tool, named navigate_to_sales_tool, enables navigation within the telegram-ollama-chat project by switching the user from the current agent to the SALES_AGENT via Telegram, REPL, or webview, confirming the transition with a success message, logging the action, and prompting the SALES_AGENT to greet the user.",
  toolName: "navigate_to_sales_tool",
  call: async ({ toolId, clientId, agentName }) => {
    console.log(NAVIGATE_TO_SALES);
    await commitToolOutput(toolId, "Navigation success", clientId, agentName);
    await changeToAgent(SALES_AGENT, clientId);
    await execute("Say hello to the user", clientId, SALES_AGENT);
  },
  type: "function",
  function: {
    name: "navigate_to_sales_tool",
    description: "Navigate to sales agent",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
});
