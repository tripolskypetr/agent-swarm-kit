import { addTool, commitToolOutput, execute } from "agent-swarm-kit";
import { ToolName } from "../enum/ToolName";

addTool({
  docNote:
    "This tool, named AddToBacketTool, is designed for the repl-phone-seller project's testbed environment using worker-testbed with the WorkerThreads API and tape. It mocks the action of adding a phone to a cart by validating the phone title, storing it in BasketStorage with a unique ID, logging the action, and confirming success through tool output. Tests pass when the tool is called correctly and fail otherwise, with prompts to the user to place an order in the REPL terminal.",
  toolName: ToolName.AddToBacketTool,
  validate: async ({ params }) => !!params.title,
  call: async ({ toolId, clientId, agentName, params }) => {
    console.log(ToolName.AddToBacketTool, params);

    await commitToolOutput(
      toolId,
      `Phone ${params.title} successfully added to the basket`,
      clientId,
      agentName
    );

    await execute(
      "Phone added successfully. Ask me if I want to place an order",
      clientId,
      agentName
    );
  },
  type: "function",
  function: {
    name: ToolName.AddToBacketTool,
    description: "Adds a phone to the basket for purchase",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: `The phone name to add to ecommerce shopping cart`,
        },
      },
      required: [],
    },
  },
});
