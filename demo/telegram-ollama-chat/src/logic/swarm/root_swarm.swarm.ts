import { addSwarm } from "agent-swarm-kit";
import { TRIAGE_AGENT } from "../agent/triage.agent";
import { SALES_AGENT } from "../agent/sales.agent";

export const ROOT_SWARM = addSwarm({
    docDescription: "This swarm, named root_swarm, serves as the core structure for the telegram-ollama-chat project, managing TRIAGE_AGENT and SALES_AGENT to handle customer interactions via Telegram, REPL, or webview, both utilizing OLLAMA_COMPLETION for conversational responses, with TRIAGE_AGENT as the default to route requests and SALES_AGENT to process pharma sales.",
    swarmName: 'root_swarm',
    agentList: [
        TRIAGE_AGENT,
        SALES_AGENT,
    ],
    defaultAgent: TRIAGE_AGENT,
});
