import {
  addTool,
  commitToolOutput,
  execute,
  Storage
} from "agent-swarm-kit";
import { ToolName } from "../enum/ToolName";
import { BasketModel } from "../../model/Basket.model";
import { StorageName } from "../enum/StorageName";
import { randomString } from "functools-kit";

addTool({
  toolName: ToolName.AddToBacketTool,
  validate: async ({ params }) => !!params.title,
  call: async ({ toolId, clientId, agentName, params }) => {
    
    console.log(ToolName.AddToBacketTool, params);

    Storage.upsert<BasketModel>({
        agentName,
        clientId,
        storageName: StorageName.BasketStorage,
        item: {
            id: randomString(),
            title: params.title as string,
            quantity: 1,
        },
    });

    await commitToolOutput(toolId, `Phone ${params.title} successfully added to the basket`, clientId, agentName);

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
          description: `Phone name obtained from ${ToolName.SearchPhoneTool} or ${ToolName.SearchPhoneByDiagonalTool}`,
        },
      },
      required: [],
    },
  },
});
