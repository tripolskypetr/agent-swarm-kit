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

    await commitToolOutput(toolId, `Телефон ${params.title} успешно добавлен в корзину`, clientId, agentName);

    await execute(
      "Телефон добавлен успешно. Задай мне вопрос, хочу ли я оформить заказ",
      clientId,
      agentName
    );
  },
  type: "function",
  function: {
    name: ToolName.AddToBacketTool,
    description: "Добавляет телефон в корзину для покупки",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: `Наименование телефона, полученное из ${ToolName.SearchPhoneTool} или ${ToolName.SearchPhoneByDiagonalTool}`,
        },
      },
      required: [],
    },
  },
});
