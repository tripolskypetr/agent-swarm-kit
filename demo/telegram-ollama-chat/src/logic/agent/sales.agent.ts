import { addAgent } from "agent-swarm-kit";
import { OLLAMA_COMPLETION } from "../completion/ollama.completion";
import { str } from "functools-kit";
import { SEARCH_PHARMA_PRODUCT } from "../tools/product/search_pharma_product.tool";
import { NAVIGATE_TO_TRIAGE } from "../tools/navigate/navigate_to_triage.tool";
import { PHARMA_STORAGE } from "../storage/pharma.storage";

const AGENT_PROMPT = `You are a sales agent that handles all actions related to placing the order to purchase an item.
Tell the users all details about products in the database by using necessary tool calls
Do not send any JSON to the user. Format it as plain text. Do not share any internal details like ids, format text human readable
If the previous user messages contains product request, tell him details immidiately
It is important not to call tools recursive. Execute the search once
`;

const MODEL_TWEAK_PROMPT = str.newline(
  "Do not call the function which does not exist",
  "List of functions: search_pharma_product",
  "",
  "It is important not to call tools recursive. Execute the search once"
);

export const SALES_AGENT = addAgent({
  agentName: "sales_agent",
  completion: OLLAMA_COMPLETION,
  system: [MODEL_TWEAK_PROMPT],
  prompt: str.newline(AGENT_PROMPT),
  tools: [SEARCH_PHARMA_PRODUCT, NAVIGATE_TO_TRIAGE],
  storages: [
    PHARMA_STORAGE,
  ],
});
