import { AgentName } from "../interfaces/Agent.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import { SwarmName } from "../interfaces/Swarm.interface";
import validateDefault from "../validation/validateDefault";
import removeXmlTags from "../utils/removeXmlTags";
import { HistoryAdapter, IHistoryAdapter } from "../classes/History";
import nameToTitle from "../utils/nameToTitle";
import LoggerAdapter, { ILoggerAdapter } from "../classes/Logger";
import { randomString, str } from "functools-kit";
import { IToolCall } from "../model/Tool.model";
import { StateName } from "../interfaces/State.interface";
import { IStorageData, StorageName } from "../interfaces/Storage.interface";
import { IGlobalConfig } from "../model/GlobalConfig.model";
import { EmbeddingName } from "../interfaces/Embedding.interface";

const CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT = "Start the conversation";

const CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT = str.newline(
  "Please analyze the last tool call message and identify any errors in its syntax or parameters.",
  "Then, provide a corrected version of the tool call that properly follows the required format and includes all necessary parameters with appropriate values.",
  "Include a brief explanation of what was fixed as a text content of a new message with correct tool calls request"
);

const CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: (
  clientId: string,
  agentName: AgentName
) => Promise<IModelMessage | null> = () => Promise.resolve(null);

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
  swarmName: SwarmName
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
    if (message.tool_calls?.length) {
      isOk = isOk && message.agentName === agentName;
    }
    return isOk;
  };

const CC_AGENT_OUTPUT_TRANSFORM = removeXmlTags;

const CC_KEEP_MESSAGES = 15;

const CC_MAX_TOOL_CALLS = 1;

const CC_AGENT_MAP_TOOLS: (
  tool: IToolCall[],
  clientId: string,
  agentName: AgentName
) => IToolCall[] | Promise<IToolCall[]> = (tools) => tools;

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

const CC_DEFAULT_STATE_SET: <T = any>(
  state: T,
  clientId: string,
  stateName: StateName
) => Promise<void> = () => Promise.resolve();

const CC_DEFAULT_STATE_GET: <T = any>(
  clientId: string,
  stateName: StateName,
  defaultState: T
) => Promise<T> = ({}, {}, defaultState) => Promise.resolve(defaultState);

const CC_DEFAULT_POLICY_GET_BAN_CLIENTS = () => [];
const CC_DEFAULT_POLICY_GET = () => [];
const CC_DEFAULT_POLICY_SET = () => Promise.resolve();

const CC_DEFAULT_STORAGE_GET: <T extends IStorageData = IStorageData>(
  clientId: string,
  storageName: StorageName,
  defaultValue: T[]
) => Promise<T[]> = ({}, {}, defaultValue) => Promise.resolve(defaultValue);

const CC_DEFAULT_STORAGE_SET: <T extends IStorageData = IStorageData>(
  data: T[],
  clientId: string,
  storageName: StorageName
) => Promise<void> = () => Promise.resolve();

const CC_NAME_TO_TITLE = nameToTitle;

const CC_FN_PLANTUML: (uml: string) => Promise<string> = () =>
  Promise.resolve("");

const CC_PROCESS_UUID = randomString();

const CC_BANHAMMER_PLACEHOLDER = "I am not going to discuss it!";

const CC_PERSIST_ENABLED_BY_DEFAULT = true;

const CC_PERSIST_MEMORY_STORAGE = true;

const CC_PERSIST_EMBEDDING_CACHE = false;

const CC_AUTOBAN_ENABLED_BY_DEFAULT = false;

const CC_SKIP_POSIX_RENAME = false;

const CC_DEFAULT_AGENT_TOOL_VALIDATE = () => true;

/**
 * Retrieves the embedding vector for a specific string hash, returning null if not found.
 * Used to check if a precomputed embedding exists in the cache.
 * @param embeddingName - The identifier of the embedding type.
 * @param stringHash - The hash of the string for which the embedding was generated.
 * @returns A promise resolving to the embedding vector or null if not cached.
 * @throws {Error} If reading from storage fails (e.g., file corruption).
 */
const CC_DEFAULT_READ_EMBEDDING_CACHE = (
  embeddingName: EmbeddingName,
  stringHash: string
) => Promise.resolve(null);

/**
 * Stores an embedding vector for a specific string hash, persisting it for future retrieval.
 * Used to cache computed embeddings to avoid redundant processing.
 * @param embeddings - Array of numerical values representing the embedding vector.
 * @param embeddingName - The identifier of the embedding type.
 * @param stringHash - The hash of the string for which the embedding was generated.
 * @returns A promise that resolves when the embedding vector is persisted.
 * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
 */
const CC_DEFAULT_WRITE_EMBEDDING_CACHE = (
  embeddings: number[],
  embeddingName: EmbeddingName,
  stringHash: string
) => Promise.resolve();

const GLOBAL_CONFIG: IGlobalConfig = {
  CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT,
  CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT,
  CC_EMPTY_OUTPUT_PLACEHOLDERS,
  CC_KEEP_MESSAGES,
  CC_MAX_TOOL_CALLS,
  CC_DEFAULT_POLICY_GET_BAN_CLIENTS,
  CC_DEFAULT_POLICY_GET,
  CC_DEFAULT_POLICY_SET,
  CC_AGENT_MAP_TOOLS,
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
  CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION,
  CC_PERSIST_ENABLED_BY_DEFAULT,
  CC_AUTOBAN_ENABLED_BY_DEFAULT,
  CC_DEFAULT_STATE_SET,
  CC_DEFAULT_STATE_GET,
  CC_DEFAULT_STORAGE_GET,
  CC_DEFAULT_STORAGE_SET,
  CC_SKIP_POSIX_RENAME,
  CC_PERSIST_MEMORY_STORAGE,
  CC_DEFAULT_READ_EMBEDDING_CACHE,
  CC_DEFAULT_WRITE_EMBEDDING_CACHE,
  CC_PERSIST_EMBEDDING_CACHE,
  CC_DEFAULT_AGENT_TOOL_VALIDATE,
};

GLOBAL_CONFIG.CC_RESQUE_STRATEGY = "flush";

export const setConfig = (config: Partial<IGlobalConfig>) => {
  Object.assign(GLOBAL_CONFIG, config);
};

export { GLOBAL_CONFIG };
