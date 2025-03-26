import { addTool, commitFlush, commitToolOutput, emit } from "agent-swarm-kit";
import { ToolName } from "../enum/ToolName";

addTool({
  docNote: "This tool facilitates adding a pharmaceutical product to the cart by accepting a product title, logging the action for debugging, confirming the addition through a tool output, flushing the commit for consistency, and notifying the user via an emitted message within the cohere-token-rotation project’s pharma sales workflow.",
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
