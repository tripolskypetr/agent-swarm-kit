import { AgentName } from "../interfaces/Agent.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import { SwarmName } from "../interfaces/Swarm.interface";
import { IHistoryAdapter } from "../classes/History";
import { ILoggerAdapter } from "../classes/Logger";
import { IToolCall } from "../model/Tool.model";
import { StateName } from "../interfaces/State.interface";
import { IStorageData, StorageName } from "../interfaces/Storage.interface";
import { PolicyName } from "../interfaces/Policy.interface";
import { SessionId } from "../interfaces/Session.interface";
import { EmbeddingName } from "../interfaces/Embedding.interface";

/**
 * Interface defining the global configuration settings and behaviors for the swarm system.
 * Centralizes constants and functions used across components like `ClientAgent` (e.g., tool handling, logging, history).
 * Influences workflows such as message processing (`CC_EMPTY_OUTPUT_PLACEHOLDERS` in `RUN_FN`), tool call recovery (`CC_RESQUE_STRATEGY` in `_resurrectModel`), and logging (`CC_LOGGER_ENABLE_DEBUG`).
 * Customizable via `setConfig` to adapt system behavior dynamically.
 */
export interface IGlobalConfig {
  /**
   * A prompt used to flush the conversation when tool call exceptions occur, specifically for troubleshooting in `llama3.1:8b` models.
   * Applied in `ClientAgent._resurrectModel` with the "flush" strategy to reset the conversation state. Requires `CC_OLLAMA_EMIT_TOOL_PROTOCOL` to be disabled.
   * @type {string}
   */
  CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT: string;

  /**
   * A multi-line prompt to recomplete invalid tool calls, designed as a fix for intermittent issues in `IlyaGusev/saiga_yandexgpt_8b_gguf` (LMStudio).
   * Used in `ClientAgent.getCompletion` with the "recomplete" strategy, instructing the model to analyze, correct, and explain tool call errors.
   * @type {string}
   */
  CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT: string;

  /**
   * An array of placeholder responses for empty model outputs, used in `ClientAgent.createPlaceholder` to greet or prompt the user.
   * Randomly selected in `ClientAgent._resurrectModel` or `RUN_FN` when output is empty, enhancing user experience by avoiding silent failures.
   * @type {string[]}
   */
  CC_EMPTY_OUTPUT_PLACEHOLDERS: string[];

  /**
   * Maximum number of messages to retain in history, used indirectly in `ClientAgent.history` management.
   * Limits history to 15 messages, though not explicitly enforced in provided `ClientAgent` code.
   * @type {number}
   */
  CC_KEEP_MESSAGES: number;

  /**
   * Maximum number of tool calls allowed per execution, used in `ClientAgent.EXECUTE_FN` to cap `toolCalls`.
   * Limits to 1 tool call by default, preventing excessive tool invocation loops in a single run.
   * @type {number}
   */
  CC_MAX_TOOL_CALLS: number;

  /**
   * Function to map tool calls for an agent, used in `ClientAgent.mapToolCalls` (e.g., `EXECUTE_FN`).
   * Default implementation returns tools unchanged, allowing customization of `IToolCall` processing via `setConfig`.
   * @param {IToolCall[]} tool - The array of tool calls from the model.
   * @param {string} clientId - The client ID invoking the tools.
   * @param {AgentName} agentName - The agent name processing the tools.
   * @returns {IToolCall[] | Promise<IToolCall[]>} The mapped tool calls, synchronously or asynchronously.
   * @example
   * setConfig({
   *   CC_AGENT_MAP_TOOLS: async (tools, clientId, agentName) => tools.map(t => ({ ...t, clientId }))
   * });
   */
  CC_AGENT_MAP_TOOLS: (
    tool: IToolCall[],
    clientId: string,
    agentName: AgentName
  ) => IToolCall[] | Promise<IToolCall[]>;

  /**
   * Factory function to provide a history adapter for an agent, used in `ClientAgent.history` (e.g., `getCompletion`).
   * Returns `HistoryAdapter` by default, implementing `IHistoryAdapter` for message storage and retrieval.
   * @param {string} clientId - The client ID needing history.
   * @param {AgentName} agentName - The agent name requiring history.
   * @returns {IHistoryAdapter} The history adapter instance.
   * @example
   * setConfig({
   *   CC_GET_AGENT_HISTORY_ADAPTER: () => CustomHistoryAdapter
   * });
   */
  CC_GET_AGENT_HISTORY_ADAPTER: (
    clientId: string,
    agentName: AgentName
  ) => IHistoryAdapter;

  /**
   * Factory function to provide a logger adapter for clients, used in `ClientAgent.logger` (e.g., debug logging).
   * Returns `LoggerAdapter` by default, implementing `ILoggerAdapter` for logging control across the system.
   * @returns {ILoggerAdapter} The logger adapter instance.
   * @example
   * setConfig({
   *   CC_GET_CLIENT_LOGGER_ADAPTER: () => CustomLoggerAdapter
   * });
   */
  CC_GET_CLIENT_LOGGER_ADAPTER: () => ILoggerAdapter;

  /**
   * Callback function triggered when the active agent changes in a swarm, used in swarm-related logic (e.g., `ISwarmParams`).
   * Default implementation is a no-op, observed indirectly in `ClientAgent.commitAgentChange` via `IBus.emit "commit-agent-change"`.
   * @param {string} clientId - The client ID affected by the change.
   * @param {AgentName} agentName - The new active agent’s name.
   * @param {SwarmName} swarmName - The swarm where the change occurs.
   * @returns {Promise<void>} A promise resolving when the change is processed.
   * @example
   * setConfig({
   *   CC_SWARM_AGENT_CHANGED: async (clientId, agentName, swarmName) => {
   *     console.log(`${agentName} is now active for ${clientId} in ${swarmName}`);
   *   }
   * });
   */
  CC_SWARM_AGENT_CHANGED: (
    clientId: string,
    agentName: AgentName,
    swarmName: SwarmName
  ) => Promise<void>;

  /**
   * Function to determine the default agent for a swarm, used in swarm initialization (e.g., `ISwarmParams`).
   * Default implementation returns the provided `defaultAgent`, aligning with swarm-agent hierarchy logic, though not directly observed in `ClientAgent`.
   * @param {string} clientId - The client ID requesting the default agent.
   * @param {SwarmName} swarmName - The swarm name.
   * @param {AgentName} defaultAgent - The fallback agent name.
   * @returns {Promise<AgentName>} A promise resolving to the default agent’s name.
   * @example
   * setConfig({
   *   CC_SWARM_DEFAULT_AGENT: async (clientId, swarmName) => "customAgent"
   * });
   */
  CC_SWARM_DEFAULT_AGENT: (
    clientId: string,
    swarmName: SwarmName,
    defaultAgent: AgentName
  ) => Promise<AgentName>;

  /**
   * Function to provide the default navigation stack for a swarm, used in `ISwarmParams` initialization.
   * Default implementation returns an empty array, part of swarm navigation setup, though not directly used in `ClientAgent`.
   * @param {string} clientId - The client ID requesting the stack.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<AgentName[]>} A promise resolving to the default stack (empty by default).
   * @example
   * setConfig({
   *   CC_SWARM_DEFAULT_STACK: async () => ["initialAgent"]
   * });
   */
  CC_SWARM_DEFAULT_STACK: (
    clientId: string,
    swarmName: SwarmName
  ) => Promise<AgentName[]>;

  /**
   * Callback function triggered when the navigation stack changes in a swarm, used in `ISwarmParams` (e.g., `navigationPop`).
   * Default implementation is a no-op, indirectly related to `ClientAgent.commitAgentChange` for stack updates.
   * @param {string} clientId - The client ID affected by the stack change.
   * @param {AgentName[]} navigationStack - The updated stack of agent names.
   * @param {SwarmName} swarmName - The swarm where the change occurs.
   * @returns {Promise<void>} A promise resolving when the stack update is processed.
   * @example
   * setConfig({
   *   CC_SWARM_STACK_CHANGED: async (clientId, stack, swarmName) => {
   *     console.log(`Stack updated for ${clientId} in ${swarmName}: ${stack}`);
   *   }
   * });
   */
  CC_SWARM_STACK_CHANGED: (
    clientId: string,
    navigationStack: AgentName[],
    swarmName: SwarmName
  ) => Promise<void>;

  /**
   * Default validation function for agent outputs, used in `ClientAgent.validate` (e.g., `RUN_FN`, `EXECUTE_FN`).
   * Imported from `validateDefault`, returns null if valid or an error string if invalid, ensuring output correctness.
   * @type {typeof validateDefault}
   */
  CC_AGENT_DEFAULT_VALIDATION: (
    output: string
  ) => string | null | Promise<string | null>;

  /**
   * Filter function for agent history, used in `ClientAgent.history.toArrayForAgent` to scope messages.
   * Ensures only relevant messages (e.g., matching `agentName` for "tool" or `tool_calls`) are included in completions.
   * @param {AgentName} agentName - The agent name to filter by.
   * @returns {(message: IModelMessage) => boolean} A predicate function to filter `IModelMessage` objects.
   * @example
   * const filter = CC_AGENT_HISTORY_FILTER("agent1");
   * const isRelevant = filter({ role: "tool", agentName: "agent1" }); // true
   */
  CC_AGENT_HISTORY_FILTER: (
    agentName: AgentName
  ) => (message: IModelMessage) => boolean;

  /**
   * Default transformation function for agent outputs, used in `ClientAgent.transform` (e.g., `RUN_FN`, `_emitOutput`).
   * Removes XML tags via `removeXmlTags` based on `CC_AGENT_DISALLOWED_TAGS` to clean responses for consistency.
   * @type {typeof removeXmlTags}
   */
  CC_AGENT_OUTPUT_TRANSFORM: (
    input: string,
    clientId: string,
    agentName: AgentName
  ) => Promise<string> | string;

  /**
   * Function to map model messages for agent output, used in `ClientAgent.map` (e.g., `RUN_FN`, `EXECUTE_FN`).
   * Default implementation returns the message unchanged, allowing customization of `IModelMessage` via `setConfig`.
   * @param {IModelMessage} message - The raw model message to map.
   * @returns {IModelMessage | Promise<IModelMessage>} The mapped message, synchronously or asynchronously.
   * @example
   * setConfig({
   *   CC_AGENT_OUTPUT_MAP: async (msg) => ({ ...msg, content: msg.content.toUpperCase() })
   * });
   */
  CC_AGENT_OUTPUT_MAP: (
    message: IModelMessage
  ) => IModelMessage | Promise<IModelMessage>;

  /**
   * Optional system prompt for agents, used in `ClientAgent.history.toArrayForAgent` (e.g., `getCompletion`).
   * Undefined by default, allowing optional agent-specific instructions to be added to history via `setConfig`.
   * @type {string[] | undefined}
   */
  CC_AGENT_SYSTEM_PROMPT: string[] | undefined;

  /**
   * Array of XML tags disallowed in agent outputs, used with `CC_AGENT_OUTPUT_TRANSFORM` in `ClientAgent.transform`.
   * Filters out tags like "tool_call" via `removeXmlTags` in `RUN_FN` to clean responses for downstream processing.
   * @type {string[]}
   */
  CC_AGENT_DISALLOWED_TAGS: string[];

  /**
   * Array of symbols disallowed in agent outputs, potentially used in validation or transformation logic.
   * Includes curly braces, suggesting filtering of JSON-like structures, though not directly observed in `ClientAgent`.
   * @type {string[]}
   */
  CC_AGENT_DISALLOWED_SYMBOLS: string[];

  /**
   * Similarity threshold for storage searches, used in `IStorage.take` for similarity-based retrieval.
   * Set to 0.65, defining the minimum similarity score for search results, though not directly in `ClientAgent`.
   * @type {number}
   */
  CC_STORAGE_SEARCH_SIMILARITY: number;

  /**
   * Maximum number of results for storage searches, used in `IStorage.take` to limit retrieval.
   * Caps search pool at 5 items by default, though not directly observed in `ClientAgent`.
   * @type {number}
   */
  CC_STORAGE_SEARCH_POOL: number;

  /**
   * Flag to enable info-level logging, used in `ClientAgent.logger` for informational logs.
   * Disabled by default (false), controlling verbosity of `ILoggerAdapter` logs.
   * @type {boolean}
   */
  CC_LOGGER_ENABLE_INFO: boolean;

  /**
   * Flag to enable debug-level logging, used extensively in `ClientAgent.logger.debug` (e.g., `RUN_FN`, `EXECUTE_FN`).
   * Disabled by default (false), gating detailed debug output in `ILoggerAdapter`.
   * @type {boolean}
   */
  CC_LOGGER_ENABLE_DEBUG: boolean;

  /**
   * Flag to enable general logging, used in `ClientAgent.logger` for basic log output.
   * Enabled by default (true), ensuring core logging functionality in `ILoggerAdapter`.
   * @type {boolean}
   */
  CC_LOGGER_ENABLE_LOG: boolean;

  /**
   * Flag to enable console logging, used in `ClientAgent.logger` for direct console output.
   * Disabled by default (false), allowing logs to be redirected via `ILoggerAdapter`.
   * @type {boolean}
   */
  CC_LOGGER_ENABLE_CONSOLE: boolean;

  /**
   * Strategy for handling model resurrection, used in `ClientAgent._resurrectModel` and `getCompletion`.
   * Options: "flush" (reset conversation), "recomplete" (retry tool calls), "custom" (user-defined); determines recovery approach for invalid outputs or tool calls.
   * @type {"flush" | "recomplete" | "custom"}
   */
  CC_RESQUE_STRATEGY: "flush" | "recomplete" | "custom";

  /**
   * Utility function to convert names to title case, used for UI or logging readability.
   * Imported from `nameToTitle`, enhancing presentation of agent or swarm names, though not directly in `ClientAgent`.
   * @type {typeof nameToTitle}
   */
  CC_NAME_TO_TITLE: (name: string) => string;

  /**
   * Function to process PlantUML diagrams, potentially for visualization purposes.
   * Default returns an empty string, allowing custom UML rendering logic via `setConfig`, though not directly in `ClientAgent`.
   * @param {string} uml - The UML string to process.
   * @returns {Promise<string>} A promise resolving to the processed UML output.
   * @example
   * setConfig({
   *   CC_FN_PLANTUML: async (uml) => `Processed: ${uml}`
   * });
   */
  CC_FN_PLANTUML: (uml: string) => Promise<string>;

  /**
   * Unique identifier for the current process, used system-wide for tracking or logging.
   * Generated via `randomString`, providing a process-specific UUID, though not directly in `ClientAgent`.
   * @type {string}
   */
  CC_PROCESS_UUID: string;

  /**
   * Placeholder response for banned topics or actions, used in `IPolicy.banClient` enforcement.
   * Indicates refusal to engage, enhancing policy messaging, though not directly in `ClientAgent`.
   * @type {string}
   */
  CC_BANHAMMER_PLACEHOLDER: string;

  /**
   * A custom function to handle tool call exceptions by returning a model message or null, used in `ClientAgent.getCompletion` with the "custom" `CC_RESQUE_STRATEGY`.
   * Default implementation returns null, allowing override via `setConfig` to implement specific recovery logic tailored to the application.
   * @param {string} clientId - The client ID experiencing the exception.
   * @param {AgentName} agentName - The name of the agent encountering the issue.
   * @returns {Promise<IModelMessage | null>} A promise resolving to a corrected message or null if unhandled.
   * @example
   * setConfig({
   *   CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: async (clientId, agentName) => ({
   *     role: "system",
   *     content: "Tool call corrected for " + agentName
   *   })
   * });
   */
  CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: (
    clientId: string,
    agentName: AgentName
  ) => Promise<IModelMessage | null>;

  /**
   * Flag to enable persistence by default, used in `IStorage` or `IState` initialization.
   * Enabled (true) by default, suggesting data retention unless overridden, though not directly in `ClientAgent`.
   * @type {boolean}
   */
  CC_PERSIST_ENABLED_BY_DEFAULT: boolean;

  /**
   * Flag to enable autobanning by default, used in `IPolicy` for automatic ban enforcement.
   * Disabled (false) by default, allowing manual ban control unless overridden, though not directly in `ClientAgent`.
   * @type {boolean}
   */
  CC_AUTOBAN_ENABLED_BY_DEFAULT: boolean;

  /**
   * Default function to set state values, used in `IState.setState` for state persistence.
   * No-op by default, allowing state updates to be customized via `setConfig`, though not directly in `ClientAgent`.
   * @template T - The type of state data.
   * @param {T} state - The state value to set.
   * @param {string} clientId - The client ID owning the state.
   * @param {StateName} stateName - The state identifier.
   * @returns {Promise<void>} A promise resolving when the state is set.
   * @example
   * setConfig({
   *   CC_DEFAULT_STATE_SET: async (state, clientId, stateName) => {
   *     console.log(`Setting ${stateName} for ${clientId}:`, state);
   *   }
   * });
   */
  CC_DEFAULT_STATE_SET: <T = any>(
    state: T,
    clientId: string,
    stateName: StateName
  ) => Promise<void>;

  /**
   * Default function to get state values, used in `IState.getState` for state retrieval.
   * Returns `defaultState` by default, allowing state retrieval to be customized via `setConfig`, though not directly in `ClientAgent`.
   * @template T - The type of state data.
   * @param {string} clientId - The client ID requesting the state.
   * @param {StateName} stateName - The state identifier.
   * @param {T} defaultState - The fallback state value.
   * @returns {Promise<T>} A promise resolving to the state value.
   * @example
   * setConfig({
   *   CC_DEFAULT_STATE_GET: async () => ({ count: 0 })
   * });
   */
  CC_DEFAULT_STATE_GET: <T = any>(
    clientId: string,
    stateName: StateName,
    defaultState: T
  ) => Promise<T>;

  /**
   * Default function to get banned clients for the policy
   * @param {PolicyName} policyName - The policy identifier.
   * @param {SwarmName} swarmName - The swarm identifier.
   * @example
   * setConfig({
   *   CC_DEFAULT_POLICY_GET_BAN_CLIENTS: async () => []
   * });
   */
  CC_DEFAULT_POLICY_GET_BAN_CLIENTS: (
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<SessionId[]> | SessionId[];

  /**
   * Retrieves the list of currently banned clients under this policy.
   * @param {PolicyName} policyName - The unique name of the policy.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {SessionId[] | Promise<SessionId[]>} An array of banned session IDs, synchronously or asynchronously.
   */
  CC_DEFAULT_POLICY_GET?: (
    policyName: PolicyName,
    swarmName: SwarmName
  ) => SessionId[] | Promise<SessionId[]>;

  /**
   * Optional function to set the list of banned clients.
   * Overrides default ban list management if provided.
   * @param {SessionId[]} clientIds - An array of session IDs to ban.
   * @param {PolicyName} policyName - The unique name of the policy.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<void> | void} A promise that resolves when the ban list is updated, or void if synchronous.
   * @throws {Error} If updating the ban list fails (e.g., due to persistence issues).
   */
  CC_DEFAULT_POLICY_SET?: (
    clientIds: SessionId[],
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<void> | void;

  /**
   * Default function to get storage data, used in `IStorage.take` for storage retrieval.
   * Returns `defaultValue` by default, allowing storage retrieval to be customized via `setConfig`, though not directly in `ClientAgent`.
   * @template T - The type of storage data extending `IStorageData`.
   * @param {string} clientId - The client ID requesting the data.
   * @param {StorageName} storageName - The storage identifier.
   * @param {T[]} defaultValue - The fallback storage data.
   * @returns {Promise<T[]>} A promise resolving to the storage data.
   * @example
   * setConfig({
   *   CC_DEFAULT_STORAGE_GET: async () => [{ id: 1 }]
   * });
   */
  CC_DEFAULT_STORAGE_GET: <T extends IStorageData = IStorageData>(
    clientId: string,
    storageName: StorageName,
    defaultValue: T[]
  ) => Promise<T[]>;

  /**
   * Default function to set storage data, used in `IStorage.upsert` for storage persistence.
   * No-op by default, allowing storage updates to be customized via `setConfig`, though not directly in `ClientAgent`.
   * @template T - The type of storage data extending `IStorageData`.
   * @param {T[]} data - The storage data to set.
   * @param {string} clientId - The client ID owning the storage.
   * @param {StorageName} storageName - The storage identifier.
   * @returns {Promise<void>} A promise resolving when the storage is set.
   * @example
   * setConfig({
   *   CC_DEFAULT_STORAGE_SET: async (data, clientId, storageName) => {
   *     console.log(`Setting ${storageName} for ${clientId}:`, data);
   *   }
   * });
   */
  CC_DEFAULT_STORAGE_SET: <T extends IStorageData = IStorageData>(
    data: T[],
    clientId: string,
    storageName: StorageName
  ) => Promise<void>;

  /**
   * Flag to skip POSIX-style renaming, potentially for file operations in persistence layers.
   * Disabled (false) by default, ensuring standard renaming unless overridden, though not directly in `ClientAgent`.
   * @type {boolean}
   */
  CC_SKIP_POSIX_RENAME: boolean;

  /**
   * Flag to enable persistent storage for `Schema.readValue` and `Schema.writeValue`, separate from general persistence.
   * Enabled (true) by default, ensuring memory storage persistence unless overridden.
   * @type {boolean}
   */
  CC_PERSIST_MEMORY_STORAGE: boolean;

  /**
   * Flag to enable persistent cache for `embeddings`. Will allow to reduce costs while using openai
   * Disabled (false) by default which faster for ollama local embeddings
   * @type {boolean}
   */
  CC_PERSIST_EMBEDDING_CACHE: boolean;

  /**
   * Retrieves the embedding vector for a specific string hash, returning null if not found.
   * Used to check if a precomputed embedding exists in the cache.
   * @param embeddingName - The identifier of the embedding type.
   * @param stringHash - The hash of the string for which the embedding was generated.
   * @returns A promise resolving to the embedding vector or null if not cached.
   * @throws {Error} If reading from storage fails (e.g., file corruption).
   */
  CC_DEFAULT_READ_EMBEDDING_CACHE: (
    embeddingName: EmbeddingName,
    stringHash: string
  ) => Promise<number[] | null> | number[] | null;

  /**
   * Stores an embedding vector for a specific string hash, persisting it for future retrieval.
   * Used to cache computed embeddings to avoid redundant processing.
   * @param embeddings - Array of numerical values representing the embedding vector.
   * @param embeddingName - The identifier of the embedding type.
   * @param stringHash - The hash of the string for which the embedding was generated.
   * @returns A promise that resolves when the embedding vector is persisted.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  CC_DEFAULT_WRITE_EMBEDDING_CACHE: (
    embeddings: number[],
    embeddingName: EmbeddingName,
    stringHash: string
  ) => Promise<void> | void;

  /**
   * Validates the tool parameters before execution.
   * Can return synchronously or asynchronously based on validation complexity.
   * @param {Object} dto - The data transfer object containing validation details.
   * @param {string} dto.clientId - The ID of the client invoking the tool.
   * @param {AgentName} dto.agentName - The name of the agent using the tool.
   * @param {IToolCall[]} dto.toolCalls - The list of tool calls in the current execution context.
   * @param {T} dto.params - The parameters to validate.
   * @returns {Promise<boolean> | boolean} True if parameters are valid, false otherwise.
   */
  CC_DEFAULT_AGENT_TOOL_VALIDATE: (dto: {
    clientId: string;
    agentName: AgentName;
    toolCalls: IToolCall[];
    params: unknown;
  }) => Promise<boolean> | boolean;
  
  /**
   * Throw an error if agents being changed recursively
   */
  CC_THROW_WHEN_NAVIGATION_RECURSION: boolean;
}
