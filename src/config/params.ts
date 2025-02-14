import { IPubsubArray, PubsubArrayAdapter, sleep } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import { SwarmName } from "../interfaces/Swarm.interface";
import validateDefault from "../validation/validateDefault";
import removeXmlTags from "../utils/removeXmlTags";

/**
 * @description `ask for agent function` in `llama3.1:8b` to troubleshoot (need CC_OLLAMA_EMIT_TOOL_PROTOCOL to be turned off)
 */
const CC_TOOL_CALL_EXCEPTION_PROMPT = "Start the conversation";

/**
 * @description When the model output is empty just say hello to the customer
 */
const CC_EMPTY_OUTPUT_PLACEHOLDERS = [
  "Sorry, I missed that. Could you say it again?",
  "I couldn't catch that. Would you mind repeating?",
  "I didn’t quite hear you. Can you repeat that, please?",
  "Pardon me, I didn’t hear that clearly. Could you repeat it?",
  "Sorry, I didn’t catch what you said. Could you say it again?",
  "Could you repeat that? I didn’t hear it clearly.",
  "I missed that. Can you say it one more time?",
  "Sorry, I didn’t get that. Could you repeat it, please?",
  "I didn’t hear you properly. Can you say that again?",
  "Could you please repeat that? I didn’t catch it.",
];

const CC_SWARM_AGENT_CHANGED: (
  clientId: string,
  agentName: AgentName,
  swarmName: SwarmName
) => Promise<void> = async () => await sleep(100);

const CC_SWARM_DEFAULT_AGENT: (
  clientId: string,
  swarmName: SwarmName,
  defaultAgent: AgentName
) => Promise<AgentName> = async ({}, {}, defaultAgent) => {
  await sleep(100);
  return defaultAgent;
};

const CC_AGENT_DEFAULT_VALIDATION = validateDefault;

const CC_AGENT_DISALLOWED_TAGS = ["tool_call", "toolcall", "tool"];

const CC_AGENT_DISALLOWED_SYMBOLS = ["{", "}"];

const CC_AGENT_HISTORY_FILTER =
  (agentName: AgentName) =>
  (message: IModelMessage): boolean => {
    let isOk = true;
    if (message.role === "tool") {
      isOk = isOk && message.agentName === agentName;
    }
    if (message.tool_calls) {
      isOk = isOk && message.agentName === agentName;
    }
    return isOk;
  };

const CC_AGENT_OUTPUT_TRANSFORM = removeXmlTags;

const CC_KEEP_MESSAGES = 5;

const CC_GET_AGENT_HISTORY: (
  clientId: string,
  agentName: AgentName
) => IPubsubArray<IModelMessage> = () => new PubsubArrayAdapter();

const CC_AGENT_OUTPUT_MAP = (
  message: IModelMessage
): IModelMessage | Promise<IModelMessage> => message;

const CC_AGENT_SEPARATE_HISTORY = false;

const CC_AGENT_SYSTEM_PROMPT: string[] | undefined = undefined;

export const GLOBAL_CONFIG = {
  CC_TOOL_CALL_EXCEPTION_PROMPT,
  CC_EMPTY_OUTPUT_PLACEHOLDERS,
  CC_KEEP_MESSAGES,
  CC_GET_AGENT_HISTORY,
  CC_SWARM_AGENT_CHANGED,
  CC_SWARM_DEFAULT_AGENT,
  CC_AGENT_DEFAULT_VALIDATION,
  CC_AGENT_HISTORY_FILTER,
  CC_AGENT_OUTPUT_TRANSFORM,
  CC_AGENT_OUTPUT_MAP,
  CC_AGENT_SYSTEM_PROMPT,
  CC_AGENT_SEPARATE_HISTORY,
  CC_AGENT_DISALLOWED_TAGS,
  CC_AGENT_DISALLOWED_SYMBOLS,
};

export const setConfig = (config: Partial<typeof GLOBAL_CONFIG>) => {
  Object.assign(GLOBAL_CONFIG, config);
};
