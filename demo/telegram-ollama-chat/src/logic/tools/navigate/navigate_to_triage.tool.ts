import { addTool, changeToDefaultAgent, commitToolOutput, executeForce } from "agent-swarm-kit";

export const NAVIGATE_TO_TRIAGE = addTool({
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
