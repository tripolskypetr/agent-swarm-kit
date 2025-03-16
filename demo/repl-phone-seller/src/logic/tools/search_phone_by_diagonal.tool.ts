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

declare function parseFloat(value: unknown): number;

addTool({
  toolName: ToolName.SearchPhoneByDiagonalTool,
  validate: async ({ params }) => !!params.diagonalFrom || !!params.diagonalTo,
  call: async ({ toolId, clientId, agentName, params }) => {
    console.log(ToolName.SearchPhoneByDiagonalTool, { params });
    const diagonalFrom = parseFloat(params.diagonalFrom ?? 0);
    const diagonalTo = parseFloat(params.diagonalTo ?? 999);
    const phones = await Storage.list<PhoneModel>({
      agentName,
      clientId,
      storageName: StorageName.PhoneStorage,
      filter: ({ diagonal }) =>
        diagonal >= diagonalFrom - 1 && diagonal <= diagonalTo + 1,
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
    name: ToolName.SearchPhoneByDiagonalTool,
    description: "Позволяет найти телефон, используя диагональ от до",
    parameters: {
      type: "object",
      properties: {
        diagonalFrom: {
          type: "number",
          description: "Диагональ ОТ включительно, число с плавающей точной",
        },
        diagonalTo: {
          type: "number",
          description: "Диагональ ДО включительно, число с плавающей точной",
        },
      },
      required: [],
    },
  },
});
