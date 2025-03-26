import { addAgent } from "agent-swarm-kit";
import { str } from "functools-kit";
import { OLLAMA_COMPLETION } from "../completion/ollama.completion";
import { NAVIGATE_TO_SALES } from "../tools/navigate/navigate_to_sales.tool";
import { PHARMA_STORAGE } from "../storage/pharma.storage";
import { SALES_AGENT } from "./sales.agent";

const AGENT_PROMPT = `You are to triage a users request, and call a tool to transfer to the right agent.
To transfer use a right tool from a list. Use the chat history instead of asking a direct question
Do not tell the user the details of your functionality
Act like a real person
Navigate to the agent without asking additional details
If the speech is about agent, navigate immediately
If you can't be sure which agent you should navigate to, ask the direct question
If you can't understand if user want to buy or return, navigate to the sales agent
It is important not to do navigation when need instead of saying hello
`;

export const TRIAGE_AGENT = addAgent({
  docDescription: "This agent, named triage_agent, operates within the telegram-ollama-chat project to route customer requests via Telegram, REPL, or webview, using the OLLAMA_COMPLETION for natural conversations, leveraging NAVIGATE_TO_SALES to transfer to the SALES_AGENT based on chat history from PHARMA_STORAGE, and acting as a human-like intermediary without revealing its internal logic.",
  agentName: "triage_agent",
  prompt: str.newline(AGENT_PROMPT),
  completion: OLLAMA_COMPLETION,
  tools: [NAVIGATE_TO_SALES],
  storages: [PHARMA_STORAGE],
  dependsOn: [
    SALES_AGENT,
  ],
});
