import {
  addTool,
  changeToAgent,
  commitToolOutput,
  execute,
} from "agent-swarm-kit";
import { SALES_AGENT } from "../../agent/sales.agent";

export const NAVIGATE_TO_SALES = addTool({
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
