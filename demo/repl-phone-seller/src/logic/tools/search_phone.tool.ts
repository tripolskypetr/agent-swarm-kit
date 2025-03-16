import {
  addTool,
  commitToolOutput,
  execute,
  Schema,
  Storage,
} from "agent-swarm-kit";
import { ToolName } from "../enum/ToolName";
import { StorageName } from "../enum/StorageName";
import { PhoneModel } from "../../model/Phone.model";

addTool({
  toolName: ToolName.SearchPhoneTool,
  validate: async ({ params }) => !!params.search,
  call: async ({ toolId, clientId, agentName, params }) => {
    console.log(ToolName.SearchPhoneTool, { params });
    const phones = await Storage.take<PhoneModel>({
      search: params.search as string,
      agentName,
      clientId,
      storageName: StorageName.PhoneStorage,
      total: 15,
      score: 0.68,
    });
    if (!phones.length) {
      await commitToolOutput(toolId, "Ничего не найдено", clientId, agentName);
      await execute(
        "Телефон не был найден, попроси меня уточнить какой телефон я хочу",
        clientId,
        agentName
      );
    }
    const phoneString = Schema.serialize(phones);
    console.log(phoneString);
    await commitToolOutput(toolId, phoneString, clientId, agentName);
    await execute(
      "Перечисли модели телефонов через запятую, которые были найдены по запросу к базе данных. Кратко опиши. Уточни, готов ли я добавить товар в корзину",
      clientId,
      agentName
    );
  },
  type: "function",
  function: {
    name: ToolName.SearchPhoneTool,
    description: "Позволяет найти телефон, используя контекстный поиск search",
    parameters: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description:
            "Набор ключевых слов для embedding поиска. Пиши запрос на русском языке",
        },
      },
      required: ["search"],
    },
  },
});
