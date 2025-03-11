import { AgentName } from "../interfaces/Agent.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import { SwarmName } from "../interfaces/Swarm.interface";
import validateDefault from "../validation/validateDefault";
import removeXmlTags from "../utils/removeXmlTags";
import { HistoryAdapter, IHistoryAdapter } from "../classes/History";
import nameToTitle from "../utils/nameToTitle";
import LoggerAdapter, { ILoggerAdapter } from "../classes/Logger";
import { randomString } from "functools-kit";

/**
 * @description `ask for agent function` in `llama3.1:8b` to troubleshoot (need CC_OLLAMA_EMIT_TOOL_PROTOCOL to be turned off)
 */
const CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT = "Start the conversation";

/**
 * @description fix for invalid tool calls on IlyaGusev/saiga_yandexgpt_8b_gguf (LMStudio, appear time to time)
 */
const CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT = "I see your previous message is malformed. Think again and resend it correct";

/**
 * @description custom function to fix the model
 */
const CC_TOOL_CALL_EXCEPTION_CUSTON_FUNCTION: (clientId: string, agentName: AgentName) => Promise<void> = () => Promise.resolve();

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
) => Promise<void> = () => Promise.resolve();

const CC_SWARM_DEFAULT_AGENT: (
  clientId: string,
  swarmName: SwarmName,
  defaultAgent: AgentName
) => Promise<AgentName> = async ({}, {}, defaultAgent) => {
  return defaultAgent;
};

const CC_SWARM_STACK_CHANGED: (
  clientId: string,
  navigationStack: AgentName[],
  swarmName: SwarmName
) => Promise<void> = () => Promise.resolve();

const CC_SWARM_DEFAULT_STACK: (
  clientId: string,
  swarmName: SwarmName,
) => Promise<AgentName[]> = async () => {
  return [];
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

const CC_KEEP_MESSAGES = 15;

const CC_GET_AGENT_HISTORY_ADAPTER: (
  clientId: string,
  agentName: AgentName
) => IHistoryAdapter = () => HistoryAdapter;

const CC_GET_CLIENT_LOGGER_ADAPTER: () => ILoggerAdapter = () => LoggerAdapter;

const CC_AGENT_OUTPUT_MAP = (
  message: IModelMessage
): IModelMessage | Promise<IModelMessage> => message;

const CC_AGENT_SYSTEM_PROMPT: string[] | undefined = undefined;

const CC_STORAGE_SEARCH_SIMILARITY = 0.65;
const CC_STORAGE_SEARCH_POOL = 5;

const CC_LOGGER_ENABLE_INFO = false;
const CC_LOGGER_ENABLE_DEBUG = false;
const CC_LOGGER_ENABLE_LOG = true;
const CC_LOGGER_ENABLE_CONSOLE = false;

let CC_RESQUE_STRATEGY: "flush" | "recomplete" | "custom";

const CC_NAME_TO_TITLE = nameToTitle;

const CC_FN_PLANTUML: (uml: string) => Promise<string> = () => Promise.resolve("");

const CC_PROCESS_UUID = randomString();

const CC_BANHAMMER_PLACEHOLDER = "You have been banned! To continue conversation, please contact the administrator."

const GLOBAL_CONFIG = {
  CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT,
  CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT,
  CC_EMPTY_OUTPUT_PLACEHOLDERS,
  CC_KEEP_MESSAGES,
  CC_GET_AGENT_HISTORY_ADAPTER,
  CC_GET_CLIENT_LOGGER_ADAPTER,
  CC_SWARM_AGENT_CHANGED,
  CC_SWARM_DEFAULT_AGENT,
  CC_SWARM_DEFAULT_STACK,
  CC_SWARM_STACK_CHANGED,
  CC_AGENT_DEFAULT_VALIDATION,
  CC_AGENT_HISTORY_FILTER,
  CC_AGENT_OUTPUT_TRANSFORM,
  CC_AGENT_OUTPUT_MAP,
  CC_AGENT_SYSTEM_PROMPT,
  CC_AGENT_DISALLOWED_TAGS,
  CC_AGENT_DISALLOWED_SYMBOLS,
  CC_STORAGE_SEARCH_SIMILARITY,
  CC_STORAGE_SEARCH_POOL,
  CC_LOGGER_ENABLE_INFO,
  CC_LOGGER_ENABLE_DEBUG,
  CC_LOGGER_ENABLE_LOG,
  CC_LOGGER_ENABLE_CONSOLE,
  CC_RESQUE_STRATEGY,
  CC_NAME_TO_TITLE,
  CC_FN_PLANTUML,
  CC_PROCESS_UUID,
  CC_BANHAMMER_PLACEHOLDER,
  CC_TOOL_CALL_EXCEPTION_CUSTON_FUNCTION,
};

GLOBAL_CONFIG.CC_RESQUE_STRATEGY = "recomplete";

export const setConfig = (config: Partial<typeof GLOBAL_CONFIG>) => {
  Object.assign(GLOBAL_CONFIG, config);
};

export { GLOBAL_CONFIG }
