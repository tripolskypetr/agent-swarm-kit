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
  docNote: "This tool, named SearchPhoneTool, enables users in the repl-phone-seller project to search for phones using contextual keywords in a REPL terminal, validating the search input, querying PhoneStorage for up to 15 matches with a similarity score, logging results, and either reporting 'nothing found' or listing found phones with descriptions while prompting to add to the cart.",
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
    name: ToolName.SearchPhoneTool,
    description: "Allows finding a phone using contextual search",
    parameters: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description:
            "A set of keywords for embedding search. Write the query in Russian",
        },
      },
      required: ["search"],
    },
  },
});
