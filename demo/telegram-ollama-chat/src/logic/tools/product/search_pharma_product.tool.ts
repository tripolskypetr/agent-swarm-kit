import {
  addTool,
  commitSystemMessage,
  commitToolOutput,
  execute,
  getLastUserMessage,
  Schema,
  SharedStorage,
} from "agent-swarm-kit";
import { str } from "functools-kit";
import { PHARMA_STORAGE } from "../../storage/pharma.storage";

export const SEARCH_PHARMA_PRODUCT = addTool({
  docNote: "This tool, named search_pharma_product, enables users in the telegram-ollama-chat project to search for pharma products via Telegram, REPL, or webview by querying PHARMA_STORAGE with a description or last user message, returning up to 5 matches with a similarity score, logging results, and either listing a found product in human-readable text or prompting for clarification if none are found, while preventing recursive calls.",
  toolName: "search_pharma_product",
  call: async ({ toolId, clientId, agentName, params }) => {
    console.log(SEARCH_PHARMA_PRODUCT, { params });
    let search = "";
    if (params.description) {
      search = String(params.description);
    } else {
      search = await getLastUserMessage(clientId);
    }
    if (!search) {
      await commitToolOutput(
        toolId,
        str.newline(`The products does not found in the database`),
        clientId,
        agentName
      );
      await execute(
        "Tell user to specify search criteria for the pharma product",
        clientId,
        agentName
      );
      return;
    }
    const products = await SharedStorage.take({
      search,
      storageName: PHARMA_STORAGE,
      total: 5,
      score: 0.55,
    });
    console.log(products)
    if (products.length) {
      await commitToolOutput(
        toolId,
        str.newline(
          `The next pharma product found in database: ${Schema.serialize(
            products.slice(0, 1)
          )}`
        ),
        clientId,
        agentName
      );
      await commitSystemMessage(
        "Do not call the search_pharma_product next time!",
        clientId,
        agentName
      );
      await execute(
        "Tell user the products found in the database.",
        clientId,
        agentName
      );
      return;
    }
    await commitToolOutput(
      toolId,
      `The products does not found in the database`,
      clientId,
      agentName
    );
    await execute(
      "Tell user to specify search criteria for the pharma product",
      clientId,
      agentName
    );
  },
  type: "function",
  function: {
    name: "search_pharma_product",
    description:
      "Retrieve several pharma products from the database based on description",
    parameters: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description:
            "REQUIRED! Minimum one word. The product description. Must include several sentences with description and keywords to find a product",
        },
      },
      required: ["description"],
    },
  },
});
