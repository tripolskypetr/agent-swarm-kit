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

/**
 * A prompt used to flush the conversation when tool call exceptions occur, specifically for troubleshooting in `llama3.1:8b` models.
 * Applied in ClientAgent._resurrectModel with "flush" strategy to reset the conversation state, requires CC_OLLAMA_EMIT_TOOL_PROTOCOL to be disabled.
 * @type {string}
 */
const CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT = "Start the conversation";

/**
 * A multi-line prompt to recomplete invalid tool calls, designed as a fix for intermittent issues in IlyaGusev/saiga_yandexgpt_8b_gguf (LMStudio).
 * Used in ClientAgent.getCompletion with "recomplete" strategy, instructing the model to analyze, correct, and explain tool call errors.
 * @type {string}
 */
const CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT = str.newline(
  "Please analyze the last tool call message and identify any errors in its syntax or parameters.",
  "Then, provide a corrected version of the tool call that properly follows the required format and includes all necessary parameters with appropriate values.",
  "Include a brief explanation of what was fixed as a text content of a new message with correct tool calls request"
);

/**
 * A custom function to handle tool call exceptions by returning a model message or null, used in ClientAgent.getCompletion with "custom" CC_RESQUE_STRATEGY.
 * Default implementation returns null, allowing for override via setConfig to implement specific recovery logic.
 * @param {string} clientId - The client ID experiencing the exception.
 * @param {AgentName} agentName - The name of the agent encountering the issue.
 * @returns {Promise<IModelMessage | null>} A promise resolving to a corrected message or null if unhandled.
 */
const CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: (
  clientId: string,
  agentName: AgentName
) => Promise<IModelMessage | null> = () => Promise.resolve(null);

/**
 * An array of placeholder responses for empty model outputs, used in ClientAgent.createPlaceholder to greet or prompt the user.
 * Randomly selected in ClientAgent._resurrectModel or RUN_FN when output is empty, enhancing user experience by avoiding silence.
 * @type {string[]}
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

/**
 * Callback function triggered when the active agent changes in a swarm, used in swarm-related logic (e.g., ISwarmParams).
 * Default implementation does nothing, observed indirectly in ClientAgent.commitAgentChange via IBus.emit "commit-agent-change".
 * @param {string} clientId - The client ID affected by the change.
 * @param {AgentName} agentName - The new active agent’s name.
 * @param {SwarmName} swarmName - The swarm where the change occurs.
 * @returns {Promise<void>} A promise resolving when the change is processed.
 */
const CC_SWARM_AGENT_CHANGED: (
  clientId: string,
  agentName: AgentName,
  swarmName: SwarmName
) => Promise<void> = () => Promise.resolve();

/**
 * Function to determine the default agent for a swarm, used in swarm initialization (e.g., ISwarmParams).
 * Default implementation returns the provided defaultAgent, not directly observed in ClientAgent but aligns with swarm-agent hierarchy.
 * @param {string} clientId - The client ID requesting the default agent.
 * @param {SwarmName} swarmName - The swarm name.
 * @param {AgentName} defaultAgent - The fallback agent name.
 * @returns {Promise<AgentName>} A promise resolving to the default agent’s name.
 */
const CC_SWARM_DEFAULT_AGENT: (
  clientId: string,
  swarmName: SwarmName,
  defaultAgent: AgentName
) => Promise<AgentName> = async ({}, {}, defaultAgent) => {
  return defaultAgent;
};

/**
 * Callback function triggered when the navigation stack changes in a swarm, used in ISwarmParams (e.g., navigationPop).
 * Default implementation does nothing, indirectly related to ClientAgent.commitAgentChange for stack updates.
 * @param {string} clientId - The client ID affected by the stack change.
 * @param {AgentName[]} navigationStack - The updated stack of agent names.
 * @param {SwarmName} swarmName - The swarm where the change occurs.
 * @returns {Promise<void>} A promise resolving when the stack update is processed.
 */
const CC_SWARM_STACK_CHANGED: (
  clientId: string,
  navigationStack: AgentName[],
  swarmName: SwarmName
) => Promise<void> = () => Promise.resolve();

/**
 * Function to provide the default navigation stack for a swarm, used in ISwarmParams initialization.
 * Default implementation returns an empty array, not directly used in ClientAgent but part of swarm navigation.
 * @param {string} clientId - The client ID requesting the stack.
 * @param {SwarmName} swarmName - The swarm name.
 * @returns {Promise<AgentName[]>} A promise resolving to the default stack (empty by default).
 */
const CC_SWARM_DEFAULT_STACK: (
  clientId: string,
  swarmName: SwarmName
) => Promise<AgentName[]> = async () => {
  return [];
};

/**
 * Default validation function for agent outputs, used in ClientAgent.validate (e.g., RUN_FN, EXECUTE_FN).
 * Imported from validateDefault, returns null or an error string to check output validity.
 * @type {typeof validateDefault}
 */
const CC_AGENT_DEFAULT_VALIDATION = validateDefault;

/**
 * Array of XML tags disallowed in agent outputs, used with CC_AGENT_OUTPUT_TRANSFORM in ClientAgent.transform.
 * Filters out tags like "tool_call" to clean responses (e.g., removeXmlTags in RUN_FN).
 * @type {string[]}
 */
const CC_AGENT_DISALLOWED_TAGS = ["tool_call", "toolcall", "tool"];

/**
 * Array of symbols disallowed in agent outputs, potentially used in validation or transformation (not directly observed in ClientAgent).
 * Includes curly braces, suggesting JSON-like structure filtering.
 * @type {string[]}
 */
const CC_AGENT_DISALLOWED_SYMBOLS = ["{", "}"];

/**
 * Filter function for agent history, used in ClientAgent.history.toArrayForAgent to scope messages.
 * Ensures only relevant messages (e.g., matching agentName for tool/tool_calls) are included in completions.
 * @param {AgentName} agentName - The agent name to filter by.
 * @returns {(message: IModelMessage) => boolean} A predicate function to filter IModelMessage objects.
 */
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

/**
 * Default transformation function for agent outputs, used in ClientAgent.transform (e.g., RUN_FN, _emitOutput).
 * Removes XML tags (via removeXmlTags) based on CC_AGENT_DISALLOWED_TAGS to clean responses.
 * @type {typeof removeXmlTags}
 */
const CC_AGENT_OUTPUT_TRANSFORM = removeXmlTags;

/**
 * Maximum number of messages to retain in history, used indirectly in ClientAgent.history management.
 * Limits history size to 15 messages, though not explicitly enforced in ClientAgent code provided.
 * @type {number}
 */
const CC_KEEP_MESSAGES = 15;

/**
 * Maximum number of tool calls allowed per execution, used in ClientAgent.EXECUTE_FN to cap toolCalls.
 * Limits to 1 tool call by default, preventing excessive tool invocation loops.
 * @type {number}
 */
const CC_MAX_TOOL_CALLS = 1;

/**
 * Function to map tool calls for an agent, used in ClientAgent.mapToolCalls (e.g., EXECUTE_FN).
 * Default implementation passes tools through unchanged, allowing customization of IToolCall processing.
 * @param {IToolCall[]} tool - The array of tool calls from the model.
 * @param {string} clientId - The client ID invoking the tools.
 * @param {AgentName} agentName - The agent name processing the tools.
 * @returns {IToolCall[] | Promise<IToolCall[]>} The mapped tool calls.
 */
const CC_AGENT_MAP_TOOLS: (
  tool: IToolCall[],
  clientId: string,
  agentName: AgentName
) => IToolCall[] | Promise<IToolCall[]> = (tools) => tools;

/**
 * Factory function to provide a history adapter for an agent, used in ClientAgent.history (e.g., getCompletion).
 * Returns HistoryAdapter by default, aligning with IHistoryAdapter for message storage.
 * @param {string} clientId - The client ID needing history.
 * @param {AgentName} agentName - The agent name requiring history.
 * @returns {IHistoryAdapter} The history adapter instance.
 */
const CC_GET_AGENT_HISTORY_ADAPTER: (
  clientId: string,
  agentName: AgentName
) => IHistoryAdapter = () => HistoryAdapter;

/**
 * Factory function to provide a logger adapter for clients, used in ClientAgent.logger (e.g., debug logging).
 * Returns LoggerAdapter by default, aligning with ILoggerAdapter for logging control.
 * @returns {ILoggerAdapter} The logger adapter instance.
 */
const CC_GET_CLIENT_LOGGER_ADAPTER: () => ILoggerAdapter = () => LoggerAdapter;

/**
 * Function to map model messages for agent output, used in ClientAgent.map (e.g., RUN_FN, EXECUTE_FN).
 * Default implementation returns the message unchanged, allowing customization of IModelMessage processing.
 * @param {IModelMessage} message - The raw model message.
 * @returns {IModelMessage | Promise<IModelMessage>} The mapped message.
 */
const CC_AGENT_OUTPUT_MAP = (
  message: IModelMessage
): IModelMessage | Promise<IModelMessage> => message;

/**
 * Optional system prompt for agents, used in ClientAgent.history.toArrayForAgent (e.g., getCompletion).
 * Undefined by default, allowing optional agent-specific instructions to be added to history.
 * @type {string[] | undefined}
 */
const CC_AGENT_SYSTEM_PROMPT: string[] | undefined = undefined;

/**
 * Similarity threshold for storage searches, potentially used in IStorage.take (not directly in ClientAgent).
 * Set to 0.65, defining the minimum similarity for search results.
 * @type {number}
 */
const CC_STORAGE_SEARCH_SIMILARITY = 0.65;

/**
 * Maximum number of results for storage searches, potentially used in IStorage.take (not directly in ClientAgent).
 * Limits search pool to 5 items by default.
 * @type {number}
 */
const CC_STORAGE_SEARCH_POOL = 5;

/**
 * Flag to enable info-level logging, used in ClientAgent.logger (e.g., debug checks).
 * Disabled by default (false), controlling verbosity of ILoggerAdapter logs.
 * @type {boolean}
 */
const CC_LOGGER_ENABLE_INFO = false;

/**
 * Flag to enable debug-level logging, used extensively in ClientAgent.logger.debug calls (e.g., RUN_FN, EXECUTE_FN).
 * Disabled by default (false), gating detailed debug output in ILoggerAdapter.
 * @type {boolean}
 */
const CC_LOGGER_ENABLE_DEBUG = false;

/**
 * Flag to enable general logging, used in ClientAgent.logger for basic log output.
 * Enabled by default (true), ensuring core logging functionality in ILoggerAdapter.
 * @type {boolean}
 */
const CC_LOGGER_ENABLE_LOG = true;

/**
 * Flag to enable console logging, used in ClientAgent.logger for direct console output.
 * Disabled by default (false), allowing logs to be redirected via ILoggerAdapter.
 * @type {boolean}
 */
const CC_LOGGER_ENABLE_CONSOLE = false;

/**
 * Strategy for handling model resurrection, used in ClientAgent._resurrectModel and getCompletion.
 * Options: "flush" (default), "recomplete", "custom"; determines recovery approach for invalid outputs or tool calls.
 * @type {"flush" | "recomplete" | "custom"}
 */
let CC_RESQUE_STRATEGY: "flush" | "recomplete" | "custom";

/**
 * Default function to set state values, used in IState.setState (not directly in ClientAgent).
 * No-op by default, allowing state updates to be customized via setConfig.
 * @template T - The type of state data.
 * @param {T} state - The state value to set.
 * @param {string} clientId - The client ID owning the state.
 * @param {StateName} stateName - The state identifier.
 * @returns {Promise<void>} A promise resolving when the state is set.
 */
const CC_DEFAULT_STATE_SET: <T = any>(
  state: T,
  clientId: string,
  stateName: StateName
) => Promise<void> = () => Promise.resolve();

/**
 * Default function to get state values, used in IState.getState (not directly in ClientAgent).
 * Returns defaultState by default, allowing state retrieval to be customized via setConfig.
 * @template T - The type of state data.
 * @param {string} clientId - The client ID requesting the state.
 * @param {StateName} stateName - The state identifier.
 * @param {T} defaultState - The fallback state value.
 * @returns {Promise<T>} A promise resolving to the state value.
 */
const CC_DEFAULT_STATE_GET: <T = any>(
  clientId: string,
  stateName: StateName,
  defaultState: T
) => Promise<T> = ({}, {}, defaultState) => Promise.resolve(defaultState);

/**
 * Default function to get storage data, used in IStorage.take (not directly in ClientAgent).
 * Returns defaultValue by default, allowing storage retrieval to be customized via setConfig.
 * @template T - The type of storage data extending IStorageData.
 * @param {string} clientId - The client ID requesting the data.
 * @param {StorageName} storageName - The storage identifier.
 * @param {T[]} defaultValue - The fallback storage data.
 * @returns {Promise<T[]>} A promise resolving to the storage data.
 */
const CC_DEFAULT_STORAGE_GET: <T extends IStorageData = IStorageData>(
  clientId: string,
  storageName: StorageName,
  defaultValue: T[]
) => Promise<T[]> = ({}, {}, defaultValue) => Promise.resolve(defaultValue);

/**
 * Default function to set storage data, used in IStorage.upsert (not directly in ClientAgent).
 * No-op by default, allowing storage updates to be customized via setConfig.
 * @template T - The type of storage data extending IStorageData.
 * @param {T[]} data - The storage data to set.
 * @param {string} clientId - The client ID owning the storage.
 * @param {StorageName} storageName - The storage identifier.
 * @returns {Promise<void>} A promise resolving when the storage is set.
 */
const CC_DEFAULT_STORAGE_SET: <T extends IStorageData = IStorageData>(
  data: T[],
  clientId: string,
  storageName: StorageName
) => Promise<void> = () => Promise.resolve();

/**
 * Utility function to convert names to title case, potentially used in UI or logging (not directly in ClientAgent).
 * Imported from nameToTitle, enhancing readability of agent or swarm names.
 * @type {typeof nameToTitle}
 */
const CC_NAME_TO_TITLE = nameToTitle;

/**
 * Function to process PlantUML diagrams, potentially for visualization (not directly in ClientAgent).
 * Default returns empty string, allowing custom UML rendering logic via setConfig.
 * @param {string} uml - The UML string to process.
 * @returns {Promise<string>} A promise resolving to the processed UML output.
 */
const CC_FN_PLANTUML: (uml: string) => Promise<string> = () =>
  Promise.resolve("");

/**
 * Unique identifier for the current process, used system-wide (not directly in ClientAgent).
 * Generated via randomString, providing a process-specific UUID for tracking or logging.
 * @type {string}
 */
const CC_PROCESS_UUID = randomString();

/**
 * Placeholder response for banned topics or actions, potentially used in IPolicy.banClient (not directly in ClientAgent).
 * Indicates refusal to engage, enhancing policy enforcement messaging.
 * @type {string}
 */
const CC_BANHAMMER_PLACEHOLDER = "I am not going to discuss it!";

/**
 * Flag to enable persistence by default, potentially used in IStorage or IState (not directly in ClientAgent).
 * Enabled (true) by default, suggesting data retention unless overridden.
 * @type {boolean}
 */
const CC_PERSIST_ENABLED_BY_DEFAULT = true;

/**
 * Schema.readValue and Schema.writeValue is being persistant by separate flag
 * @type {boolean}
 */
const CC_PERSIST_MEMORY_STORAGE = true;

/**
 * Flag to enable autobanning by default, potentially used in IPolicy (not directly in ClientAgent).
 * Disabled (false) by default, allowing manual ban control unless overridden.
 * @type {boolean}
 */
const CC_AUTOBAN_ENABLED_BY_DEFAULT = false;

/**
 * Flag to skip POSIX-style renaming, potentially for file operations (not directly in ClientAgent).
 * Disabled (false) by default, ensuring standard renaming unless overridden.
 * @type {boolean}
 */
const CC_SKIP_POSIX_RENAME = false;

/**
 * Global configuration object defining default settings and behaviors for the swarm system.
 * Centralizes constants and functions used across components like ClientAgent (e.g., tool handling, logging, history), customizable via setConfig.
 * Influences workflows such as message processing (e.g., CC_EMPTY_OUTPUT_PLACEHOLDERS in RUN_FN), tool call recovery (e.g., CC_RESQUE_STRATEGY in _resurrectModel), and logging (e.g., CC_LOGGER_ENABLE_DEBUG).
 * @type {typeof GLOBAL_CONFIG}
 */
const GLOBAL_CONFIG = {
  CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT,
  CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT,
  CC_EMPTY_OUTPUT_PLACEHOLDERS,
  CC_KEEP_MESSAGES,
  CC_MAX_TOOL_CALLS,
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
};

/**
 * Initial setting for the model resurrection strategy in GLOBAL_CONFIG.
 * Defaults to "flush", used in ClientAgent._resurrectModel to reset conversations on invalid outputs or tool calls.
 * Can be overridden via setConfig to "recomplete" or "custom" for alternative recovery strategies.
 * @type {"flush" | "recomplete" | "custom"}
 */
GLOBAL_CONFIG.CC_RESQUE_STRATEGY = "flush";

/**
 * Function to update the GLOBAL_CONFIG object with custom settings at runtime.
 * Merges provided config overrides into GLOBAL_CONFIG, allowing dynamic adjustment of system behavior (e.g., enabling CC_LOGGER_ENABLE_DEBUG for ClientAgent).
 * @param {Partial<typeof GLOBAL_CONFIG>} config - The partial configuration object to apply.
 * @returns {void}
 * @example
 * setConfig({ CC_LOGGER_ENABLE_DEBUG: true }); // Enables debug logging
 */
export const setConfig = (config: Partial<typeof GLOBAL_CONFIG>) => {
  Object.assign(GLOBAL_CONFIG, config);
};

/**
 * Exported GLOBAL_CONFIG object providing access to system-wide settings.
 * Used throughout the swarm system (e.g., ClientAgent, ISwarmParams) to define defaults for tool handling, logging, history, and more.
 * @type {typeof GLOBAL_CONFIG}
 */
export { GLOBAL_CONFIG };
