import { addTool, commitFlush, commitToolOutput, emit } from "agent-swarm-kit";
import { ToolName } from "../enum/ToolName";

addTool({
  docNote: "This tool enables adding a pharmaceutical product to the cart in the langchain-stream project by accepting a product title, logging the action for debugging, confirming the addition through a tool output, flushing the commit for consistency, and notifying the user via an emitted message, supporting real-time interactions within a system streaming tokens from multiple completions.",
  toolName: ToolName.AddToCartTool,
  call: async ({ toolId, clientId, agentName, params }) => {
    console.log(ToolName.AddToCartTool, params);
    await commitToolOutput(
      toolId,
      `Pharma product ${params.title} added successfully. `,
      clientId,
      agentName
    );
    await commitFlush(clientId, agentName);
    await emit(
      `The product ${params.title} has been added to your cart.`,
      clientId,
      agentName
    );
  },
  type: "function",
  function: {
    name: ToolName.AddToCartTool,
    description: "Add the pharma product to cart",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: `Name of pharma product to be appended to cart`,
        },
      },
      required: [],
    },
  },
});
