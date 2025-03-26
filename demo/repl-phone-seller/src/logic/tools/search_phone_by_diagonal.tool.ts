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
  docNote: "This tool, named SearchPhoneByDiagonalTool, enables users in the repl-phone-seller project to search for phones by diagonal range in a REPL terminal, validating input for diagonal bounds, querying PhoneStorage for matches within a tolerance, logging results, and either reporting 'nothing found' or listing found phones with descriptions while prompting to add to the cart.",
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
      await commitToolOutput(toolId, "Nothing found", clientId, agentName);
      await execute(
        "The phone was not found, ask me to clarify which phone I want",
        clientId,
        agentName
      );
    }
    const phoneString = Schema.serialize(phones);
    console.log(phoneString);
    await commitToolOutput(toolId, phoneString, clientId, agentName);
    await execute(
      "List the phone models found in the database query, separated by commas. Provide a brief description. Ask if I’m ready to add an item to the basket",
      clientId,
      agentName
    );
  },
  type: "function",
  function: {
    name: ToolName.SearchPhoneByDiagonalTool,
    description: "Allows finding a phone using a diagonal range from and to",
    parameters: {
      type: "object",
      properties: {
        diagonalFrom: {
          type: "number",
          description: "Diagonal FROM inclusive, a floating-point number",
        },
        diagonalTo: {
          type: "number",
          description: "Diagonal TO inclusive, a floating-point number",
        },
      },
      required: [],
    },
  },
});
