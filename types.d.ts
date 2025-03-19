import * as di_scoped from 'di-scoped';
import * as functools_kit from 'functools-kit';
import { SortedArray, Subject } from 'functools-kit';

/**
 * Interface defining the structure of execution context in the swarm system.
 * Represents metadata for tracking a specific execution, used across services like ClientAgent, PerfService, and BusService.
 * @interface IExecutionContext
 */
interface IExecutionContext {
    /**
     * The unique identifier of the client session, tying to ClientAgent’s clientId and PerfService’s execution tracking.
     * @type {string}
     */
    clientId: string;
    /**
     * The unique identifier of the execution instance, used in PerfService (e.g., startExecution) and BusService (e.g., commitExecutionBegin).
     * @type {string}
     */
    executionId: string;
    /**
     * The unique identifier of the process, sourced from GLOBAL_CONFIG.CC_PROCESS_UUID, used in PerfService’s IPerformanceRecord.processId.
     * @type {string}
     */
    processId: string;
}
/**
 * Scoped service class providing execution context information in the swarm system.
 * Stores and exposes an IExecutionContext object (clientId, executionId, processId) via dependency injection, scoped using di-scoped for execution-specific instances.
 * Integrates with ClientAgent (e.g., EXECUTE_FN execution context), PerfService (e.g., execution tracking in startExecution), BusService (e.g., execution events in commitExecutionBegin), and LoggerService (e.g., context logging in info).
 * Provides a lightweight, immutable context container for tracking execution metadata across the system.
 */
declare const ExecutionContextService: (new () => {
    readonly context: IExecutionContext;
}) & Omit<{
    new (context: IExecutionContext): {
        readonly context: IExecutionContext;
    };
}, "prototype"> & di_scoped.IScopedClassRun<[context: IExecutionContext]>;

/**
 * Interface defining the structure of a payload context, used to encapsulate execution metadata and payload data.
 * @template Payload - The type of the payload object, defaults to a generic object.
 */
interface IPayloadContext<Payload extends object = object> {
    /** The unique identifier of the client associated with this context. */
    clientId: string;
    /** The payload data carried by this context, typed according to the Payload generic. */
    payload: Payload;
}
/**
 * A scoped service class that encapsulates a payload context for dependency injection.
 * Provides a way to access execution metadata and payload data within a specific scope.
 * Scoped using `di-scoped` to ensure instance isolation per scope.
 */
declare const PayloadContextService: (new () => {
    readonly context: IPayloadContext;
}) & Omit<{
    new (context: IPayloadContext): {
        readonly context: IPayloadContext;
    };
}, "prototype"> & di_scoped.IScopedClassRun<[context: IPayloadContext<object>]>;

/**
 * Interface representing an incoming message received by the swarm system.
 * Encapsulates a message entering the system, typically from a client (e.g., user input), processed by agents (e.g., ClientAgent.execute) or sessions (e.g., ISession.connect).
 * Used to convey data from an external source to an agent, potentially triggering actions like history updates (e.g., IHistory.push) or event emissions (e.g., IBus.emit "commit-user-message").
 */
interface IIncomingMessage {
    /**
     * The unique identifier of the client sending the message.
     * Identifies the originating client session, matching clientId in runtime params (e.g., this.params.clientId in ClientAgent), ensuring the message is tied to a specific sender.
     * Example: "client-123" for a user session submitting a command.
     * @type {string}
     */
    clientId: string;
    /**
     * The content or payload of the incoming message.
     * Contains the raw data sent by the client, typically a string (e.g., user command, query), processed as input by agents (e.g., incoming in ClientAgent.execute).
     * Example: "What is the weather?" for a user query received by an agent.
     * @type {string}
     */
    data: string;
    /**
     * The name of the agent designated to receive or process the message.
     * Links the message to a specific agent instance (e.g., this.params.agentName in ClientAgent), aligning with AgentName from IAgentParams for routing or context.
     * Example: "WeatherAgent" for an agent handling weather-related queries.
     * @type {AgentName}
     */
    agentName: AgentName;
}
/**
 * Interface representing an outgoing message sent from the swarm system.
 * Encapsulates a message dispatched to a client, typically an agent’s response or output (e.g., ClientAgent._emitOutput), delivered via sessions (e.g., ISession.emit) or events (e.g., IBus.emit "emit-output").
 * Used to communicate results or notifications back to the client, reflecting the system’s response to incoming messages or internal actions.
 */
interface IOutgoingMessage {
    /**
     * The unique identifier of the client receiving the message.
     * Specifies the target client session, matching clientId in runtime params (e.g., this.params.clientId in ClientAgent), ensuring delivery to the intended recipient.
     * Example: "client-123" for a user session receiving a response.
     * @type {string}
     */
    clientId: string;
    /**
     * The content or payload of the outgoing message.
     * Contains the data sent to the client, typically a string (e.g., processed result, assistant response), generated by agents (e.g., result in ClientAgent._emitOutput).
     * Example: "The weather is sunny." for an agent’s response to a query.
     * @type {string}
     */
    data: string;
    /**
     * The name of the agent sending the message.
     * Identifies the originating agent instance (e.g., this.params.agentName in ClientAgent), aligning with AgentName from IAgentParams to indicate the source of the response.
     * Example: "WeatherAgent" for an agent replying to a client query.
     * @type {AgentName}
     */
    agentName: AgentName;
}

/**
 * Interface representing a logging mechanism for the swarm system.
 * Provides methods to record messages at different severity levels, used across components like agents, sessions, states, storage, swarms, history, embeddings, completions, and policies.
 * Logs are utilized to track lifecycle events (e.g., initialization, disposal), operational details (e.g., tool calls, message emissions), validation outcomes (e.g., policy checks), and errors (e.g., persistence failures), aiding in debugging, monitoring, and auditing.
 */
interface ILogger {
    /**
     * Logs a general-purpose message.
     * Used throughout the swarm system to record significant events or state changes, such as agent execution, session connections, or storage updates.
     * @param {string} topic - The category or context of the log message (e.g., "AgentExecution", "StorageUpsert").
     * @param {...any[]} args - Variable arguments representing the message content, which can include strings, objects, or other data types for flexible logging.
     */
    log(topic: string, ...args: any[]): void;
    /**
     * Logs a debug-level message.
     * Employed for detailed diagnostic information, such as intermediate states during agent tool calls, swarm navigation changes, or embedding creation processes, typically enabled in development or troubleshooting scenarios.
     * @param {string} topic - The category or context of the debug message (e.g., "ToolValidation", "EmbeddingSimilarity").
     * @param {...any[]} args - Variable arguments representing the debug content, often detailed data like parameters, stack traces, or internal states.
     */
    debug(topic: string, ...args: any[]): void;
    /**
     * Logs an info-level message.
     * Used to record informational updates, such as successful completions, policy validations, or history commits, providing a high-level overview of system activity without excessive detail.
     * @param {string} topic - The category or context of the info message (e.g., "SessionInit", "PolicyBan").
     * @param {...any[]} args - Variable arguments representing the informational content, typically concise summaries or status updates.
     */
    info(topic: string, ...args: any[]): void;
}

/**
 * Type representing an array of numbers as embeddings.
 * Used to encode text or data for similarity comparisons in storage or search operations.
 * @typedef {number[]} Embeddings
 */
type Embeddings = number[];
/**
 * Interface representing callbacks for embedding lifecycle events.
 * Provides hooks for creation and comparison of embeddings.
 */
interface IEmbeddingCallbacks {
    /**
     * Callback triggered when an embedding is created.
     * Useful for logging or post-processing the generated embeddings.
     * @param {string} text - The input text used to generate the embedding.
     * @param {Embeddings} embeddings - The resulting embedding as an array of numbers.
     * @param {string} clientId - The unique ID of the client associated with the embedding.
     * @param {EmbeddingName} embeddingName - The unique name of the embedding mechanism.
     */
    onCreate(text: string, embeddings: Embeddings, clientId: string, embeddingName: EmbeddingName): void;
    /**
     * Callback triggered when two embeddings are compared for similarity.
     * Useful for logging or analyzing similarity results.
     * @param {string} text1 - The first text whose embedding was used in the comparison.
     * @param {string} text2 - The second text whose embedding was used in the comparison.
     * @param {number} similarity - The similarity score between the two embeddings (e.g., cosine similarity).
     * @param {string} clientId - The unique ID of the client associated with the comparison.
     * @param {EmbeddingName} embeddingName - The unique name of the embedding mechanism.
     */
    onCompare(text1: string, text2: string, similarity: number, clientId: string, embeddingName: EmbeddingName): void;
}
/**
 * Interface representing the schema for configuring an embedding mechanism.
 * Defines how embeddings are created and compared within the swarm.
 */
interface IEmbeddingSchema {
    /** The unique name of the embedding mechanism within the swarm. */
    embeddingName: EmbeddingName;
    /**
     * Creates an embedding from the provided text.
     * Typically used for indexing or search operations in storage.
     * @param {string} text - The text to encode into an embedding.
     * @returns {Promise<Embeddings>} A promise resolving to the generated embedding as an array of numbers.
     * @throws {Error} If embedding creation fails (e.g., due to invalid text or model errors).
     */
    createEmbedding(text: string): Promise<Embeddings>;
    /**
     * Calculates the similarity between two embeddings.
     * Commonly used for search or ranking operations (e.g., cosine similarity).
     * @param {Embeddings} a - The first embedding to compare.
     * @param {Embeddings} b - The second embedding to compare.
     * @returns {Promise<number>} A promise resolving to the similarity score (typically between -1 and 1).
     * @throws {Error} If similarity calculation fails (e.g., due to invalid embeddings or computation errors).
     */
    calculateSimilarity(a: Embeddings, b: Embeddings): Promise<number>;
    /** Optional partial set of callbacks for embedding events, allowing customization of creation and comparison. */
    callbacks?: Partial<IEmbeddingCallbacks>;
}
/**
 * Type representing the unique name of an embedding mechanism within the swarm.
 * @typedef {string} EmbeddingName
 */
type EmbeddingName = string;

/**
 * Type representing the unique identifier for storage items.
 * @typedef {string | number} StorageId
 */
type StorageId = string | number;
/**
 * Interface representing the data structure stored in the storage.
 * Defines the minimum required properties for storage items.
 */
interface IStorageData {
    /** The unique identifier for the storage item, used for retrieval and removal. */
    id: StorageId;
}
/**
 * Interface representing the schema for storage configuration.
 * Defines how storage behaves, including persistence, indexing, and data access.
 * @template T - The type of the storage data, defaults to IStorageData.
 */
interface IStorageSchema<T extends IStorageData = IStorageData> {
    /** Optional flag to enable serialization of storage data to persistent storage (e.g., hard drive). */
    persist?: boolean;
    /** Optional description for documentation purposes, aiding in storage usage understanding. */
    docDescription?: string;
    /** Optional flag indicating whether the storage instance is shared across all agents for a client. */
    shared?: boolean;
    /**
     * Optional function to retrieve data from the storage, overriding default behavior.
     * @param {string} clientId - The unique ID of the client requesting the data.
     * @param {StorageName} storageName - The unique name of the storage.
     * @param {T[]} defaultValue - The default data to return if no data is found.
     * @returns {Promise<T[]> | T[]} The stored data, synchronously or asynchronously.
     */
    getData?: (clientId: string, storageName: StorageName, defaultValue: T[]) => Promise<T[]> | T[];
    /**
     * Optional function to persist storage data to the hard drive, overriding default behavior.
     * @param {T[]} data - The data to persist.
     * @param {string} clientId - The unique ID of the client updating the storage.
     * @param {StorageName} storageName - The unique name of the storage.
     * @returns {Promise<void> | void} A promise that resolves when data is persisted, or void if synchronous.
     * @throws {Error} If persistence fails (e.g., due to disk errors).
     */
    setData?: (data: T[], clientId: string, storageName: StorageName) => Promise<void> | void;
    /**
     * Function to generate an index for a storage item, used for search and retrieval.
     * @param {T} item - The storage item to index.
     * @returns {Promise<string> | string} The index string for the item, synchronously or asynchronously.
     */
    createIndex(item: T): Promise<string> | string;
    /** The name of the embedding mechanism used for indexing and searching storage data. */
    embedding: EmbeddingName;
    /** The unique name of the storage within the swarm. */
    storageName: StorageName;
    /** Optional partial set of lifecycle callbacks for storage events, allowing customization. */
    callbacks?: Partial<IStorageCallbacks<T>>;
    /**
     * Optional function to provide the default data for the storage, resolved in persistence logic.
     * @param {string} clientId - The unique ID of the client requesting the default data.
     * @param {StorageName} storageName - The unique name of the storage.
     * @returns {Promise<T[]> | T[]} The default data array, synchronously or asynchronously.
     */
    getDefaultData?: (clientId: string, storageName: StorageName) => Promise<T[]> | T[];
}
/**
 * Interface representing callbacks for storage lifecycle and operational events.
 * Provides hooks for updates, searches, initialization, and disposal.
 * @template T - The type of the storage data, defaults to IStorageData.
 */
interface IStorageCallbacks<T extends IStorageData = IStorageData> {
    /**
     * Callback triggered when storage data is updated (e.g., via upsert or remove).
     * Useful for logging or synchronizing state.
     * @param {T[]} items - The updated array of storage items.
     * @param {string} clientId - The unique ID of the client associated with the storage.
     * @param {StorageName} storageName - The unique name of the storage.
     */
    onUpdate: (items: T[], clientId: string, storageName: StorageName) => void;
    /**
     * Callback triggered during a search operation on the storage.
     * @param {string} search - The search query used to filter items.
     * @param {SortedArray<T>} index - The sorted array of storage items based on the search.
     * @param {string} clientId - The unique ID of the client performing the search.
     * @param {StorageName} storageName - The unique name of the storage.
     */
    onSearch: (search: string, index: SortedArray<T>, clientId: string, storageName: StorageName) => void;
    /**
     * Callback triggered when the storage is initialized.
     * Useful for setup or logging.
     * @param {string} clientId - The unique ID of the client associated with the storage.
     * @param {StorageName} storageName - The unique name of the storage.
     */
    onInit: (clientId: string, storageName: StorageName) => void;
    /**
     * Callback triggered when the storage is disposed of.
     * Useful for cleanup or logging.
     * @param {string} clientId - The unique ID of the client associated with the storage.
     * @param {StorageName} storageName - The unique name of the storage.
     */
    onDispose: (clientId: string, storageName: StorageName) => void;
}
/**
 * Interface representing the runtime parameters for storage management.
 * Extends the storage schema with client-specific and embedding-related dependencies.
 * @template T - The type of the storage data, defaults to IStorageData.
 * @extends {IStorageSchema<T>}
 * @extends {Partial<IEmbeddingCallbacks>}
 */
interface IStorageParams<T extends IStorageData = IStorageData> extends IStorageSchema<T>, Partial<IEmbeddingCallbacks> {
    /** The unique ID of the client associated with the storage instance. */
    clientId: string;
    /**
     * Function to calculate similarity between embeddings, inherited from the embedding schema.
     * Used for search operations.
     */
    calculateSimilarity: IEmbeddingSchema["calculateSimilarity"];
    /**
     * Function to create an embedding for storage items, inherited from the embedding schema.
     * Used for indexing.
     */
    createEmbedding: IEmbeddingSchema["createEmbedding"];
    /** The unique name of the storage within the swarm (redundant with schema but included for clarity). */
    storageName: StorageName;
    /** The logger instance for recording storage-related activity and errors. */
    logger: ILogger;
    /** The bus instance for event communication within the swarm. */
    bus: IBus;
}
/**
 * Interface representing the runtime storage management API.
 * Provides methods to manipulate and query storage data.
 * @template T - The type of the storage data, defaults to IStorageData.
 */
interface IStorage<T extends IStorageData = IStorageData> {
    /**
     * Retrieves a specified number of items from the storage based on a search query.
     * Uses embeddings for similarity-based retrieval.
     * @param {string} search - The search query to filter items.
     * @param {number} total - The maximum number of items to retrieve.
     * @param {number} [score] - Optional similarity score threshold for filtering items.
     * @returns {Promise<T[]>} A promise resolving to an array of matching storage items.
     * @throws {Error} If retrieval fails (e.g., due to embedding issues or invalid query).
     */
    take(search: string, total: number, score?: number): Promise<T[]>;
    /**
     * Inserts or updates an item in the storage.
     * Updates the index and persists data if configured.
     * @param {T} item - The item to upsert into the storage.
     * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
     * @throws {Error} If upsert fails (e.g., due to persistence issues or invalid item).
     */
    upsert(item: T): Promise<void>;
    /**
     * Removes an item from the storage by its ID.
     * Updates the index and persists changes if configured.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @returns {Promise<void>} A promise that resolves when the removal operation is complete.
     * @throws {Error} If removal fails (e.g., due to persistence issues or invalid ID).
     */
    remove(itemId: IStorageData["id"]): Promise<void>;
    /**
     * Retrieves an item from the storage by its ID.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
     * @returns {Promise<T | null>} A promise resolving to the item if found, or null if not found.
     * @throws {Error} If retrieval fails (e.g., due to internal errors).
     */
    get(itemId: IStorageData["id"]): Promise<T | null>;
    /**
     * Lists all items in the storage, optionally filtered by a predicate.
     * @param {(item: T) => boolean} [filter] - Optional function to filter items; only items returning true are included.
     * @returns {Promise<T[]>} A promise resolving to an array of storage items.
     * @throws {Error} If listing fails (e.g., due to persistence issues).
     */
    list(filter?: (item: T) => boolean): Promise<T[]>;
    /**
     * Clears all items from the storage, resetting it to an empty state.
     * Persists changes if configured.
     * @returns {Promise<void>} A promise that resolves when the clear operation is complete.
     * @throws {Error} If clearing fails (e.g., due to persistence issues).
     */
    clear(): Promise<void>;
}
/**
 * Type representing the unique name of a storage within the swarm.
 * @typedef {string} StorageName
 */
type StorageName = string;

/**
 * Type representing the data structure of a state.
 * Can be any type, serving as a generic placeholder for state values.
 * @typedef {any} IStateData
 */
type IStateData = any;
/**
 * Interface representing a middleware function for state management.
 * Allows modification or validation of state during lifecycle operations.
 * @template T - The type of the state data, defaults to IStateData.
 */
interface IStateMiddleware<T extends IStateData = IStateData> {
    /**
     * Processes the state, potentially modifying it before it’s finalized.
     * @param {T} state - The current state data to process.
     * @param {string} clientId - The unique ID of the client associated with the state.
     * @param {StateName} stateName - The unique name of the state.
     * @returns {Promise<T>} A promise resolving to the updated state after middleware processing.
     * @throws {Error} If middleware processing fails or validation conditions are not met.
     */
    (state: T, clientId: string, stateName: StateName): Promise<T>;
}
/**
 * Interface representing callbacks for state lifecycle events.
 * Provides hooks for initialization, disposal, and state transitions.
 * @template T - The type of the state data, defaults to IStateData.
 */
interface IStateCallbacks<T extends IStateData = IStateData> {
    /**
     * Callback triggered when the state is initialized.
     * Useful for setup or logging.
     * @param {string} clientId - The unique ID of the client associated with the state.
     * @param {StateName} stateName - The unique name of the state.
     */
    onInit: (clientId: string, stateName: StateName) => void;
    /**
     * Callback triggered when the state is disposed of.
     * Useful for cleanup or logging.
     * @param {string} clientId - The unique ID of the client associated with the state.
     * @param {StateName} stateName - The unique name of the state.
     */
    onDispose: (clientId: string, stateName: StateName) => void;
    /**
     * Callback triggered when the state is loaded from storage or initialized.
     * @param {T} state - The loaded state data.
     * @param {string} clientId - The unique ID of the client associated with the state.
     * @param {StateName} stateName - The unique name of the state.
     */
    onLoad: (state: T, clientId: string, stateName: StateName) => void;
    /**
     * Callback triggered when the state is read.
     * Useful for monitoring or logging read operations.
     * @param {T} state - The current state data being read.
     * @param {string} clientId - The unique ID of the client associated with the state.
     * @param {StateName} stateName - The unique name of the state.
     */
    onRead: (state: T, clientId: string, stateName: StateName) => void;
    /**
     * Callback triggered when the state is written or updated.
     * Useful for tracking changes or triggering side effects.
     * @param {T} state - The updated state data being written.
     * @param {string} clientId - The unique ID of the client associated with the state.
     * @param {StateName} stateName - The unique name of the state.
     */
    onWrite: (state: T, clientId: string, stateName: StateName) => void;
}
/**
 * Interface representing the schema for state management.
 * Defines the configuration and behavior of a state within the swarm.
 * @template T - The type of the state data, defaults to IStateData.
 */
interface IStateSchema<T extends IStateData = IStateData> {
    /** Optional flag to enable serialization of state values to persistent storage (e.g., hard drive). */
    persist?: boolean;
    /** Optional description for documentation purposes, aiding in state usage understanding. */
    docDescription?: string;
    /** Optional flag indicating whether the state can be shared across multiple agents. */
    shared?: boolean;
    /** The unique name of the state within the swarm. */
    stateName: StateName;
    /**
     * Function to retrieve or compute the default state value.
     * @param {string} clientId - The unique ID of the client requesting the state.
     * @param {StateName} stateName - The unique name of the state.
     * @returns {T | Promise<T>} The default state value, synchronously or asynchronously.
     */
    getDefaultState: (clientId: string, stateName: StateName) => T | Promise<T>;
    /**
     * Optional function to retrieve the current state, with a fallback to the default state.
     * Overrides default state retrieval behavior if provided.
     * @param {string} clientId - The unique ID of the client requesting the state.
     * @param {StateName} stateName - The unique name of the state.
     * @param {T} defaultState - The default state value to use if no state is found.
     * @returns {T | Promise<T>} The current state value, synchronously or asynchronously.
     */
    getState?: (clientId: string, stateName: StateName, defaultState: T) => T | Promise<T>;
    /**
     * Optional function to set or update the state.
     * Overrides default state setting behavior if provided.
     * @param {T} state - The new state value to set.
     * @param {string} clientId - The unique ID of the client updating the state.
     * @param {StateName} stateName - The unique name of the state.
     * @returns {Promise<void> | void} A promise that resolves when the state is set, or void if synchronous.
     * @throws {Error} If the state update fails (e.g., due to persistence issues).
     */
    setState?: (state: T, clientId: string, stateName: StateName) => Promise<void> | void;
    /** Optional array of middleware functions to process the state during lifecycle operations. */
    middlewares?: IStateMiddleware<T>[];
    /** Optional partial set of lifecycle callbacks for the state, allowing customization of state events. */
    callbacks?: Partial<IStateCallbacks<T>>;
}
/**
 * Interface representing the runtime parameters for state management.
 * Extends the state schema with client-specific runtime dependencies.
 * @template T - The type of the state data, defaults to IStateData.
 * @extends {IStateSchema<T>}
 */
interface IStateParams<T extends IStateData = IStateData> extends IStateSchema<T> {
    /** The unique ID of the client associated with the state instance. */
    clientId: string;
    /** The logger instance for recording state-related activity and errors. */
    logger: ILogger;
    /** The bus instance for event communication within the swarm. */
    bus: IBus;
}
/**
 * Interface representing the runtime state management API.
 * Provides methods to get, set, and clear the state.
 * @template T - The type of the state data, defaults to IStateData.
 */
interface IState<T extends IStateData = IStateData> {
    /**
     * Retrieves the current state value.
     * Applies any configured middleware or custom `getState` logic from the schema.
     * @returns {Promise<T>} A promise resolving to the current state value.
     * @throws {Error} If state retrieval fails (e.g., due to persistence issues or invalid configuration).
     */
    getState: () => Promise<T>;
    /**
     * Updates the state using a dispatch function that computes the new state from the previous state.
     * Applies any configured middleware or custom `setState` logic from the schema.
     * @param {(prevState: T) => Promise<T>} dispatchFn - An async function that takes the previous state and returns the new state.
     * @returns {Promise<T>} A promise resolving to the updated state value.
     * @throws {Error} If state update fails (e.g., due to middleware errors or persistence issues).
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;
    /**
     * Resets the state to its initial default value.
     * Reverts to the value provided by `getDefaultState` in the schema.
     * @returns {Promise<T>} A promise resolving to the initial state value.
     * @throws {Error} If state clearing fails (e.g., due to persistence issues or invalid default state).
     */
    clearState: () => Promise<T>;
}
/**
 * Type representing the unique name of a state within the swarm.
 * @typedef {string} StateName
 */
type StateName = string;

/**
 * Interface representing callbacks for policy lifecycle and validation events.
 * Provides hooks for initialization, validation, and ban actions.
 */
interface IPolicyCallbacks {
    /**
     * Optional callback triggered when the policy is initialized.
     * Useful for setup or logging.
     * @param {PolicyName} policyName - The unique name of the policy.
     */
    onInit?: (policyName: PolicyName) => void;
    /**
     * Optional callback triggered to validate incoming messages.
     * Useful for logging or monitoring input validation.
     * @param {string} incoming - The incoming message to validate.
     * @param {SessionId} clientId - The unique session ID of the client sending the message.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @param {PolicyName} policyName - The unique name of the policy.
     */
    onValidateInput?: (incoming: string, clientId: SessionId, swarmName: SwarmName, policyName: PolicyName) => void;
    /**
     * Optional callback triggered to validate outgoing messages.
     * Useful for logging or monitoring output validation.
     * @param {string} outgoing - The outgoing message to validate.
     * @param {SessionId} clientId - The unique session ID of the client receiving the message.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @param {PolicyName} policyName - The unique name of the policy.
     */
    onValidateOutput?: (outgoing: string, clientId: SessionId, swarmName: SwarmName, policyName: PolicyName) => void;
    /**
     * Optional callback triggered when a client is banned.
     * Useful for logging or triggering ban-related actions.
     * @param {SessionId} clientId - The unique session ID of the banned client.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @param {PolicyName} policyName - The unique name of the policy.
     */
    onBanClient?: (clientId: SessionId, swarmName: SwarmName, policyName: PolicyName) => void;
    /**
     * Optional callback triggered when a client is unbanned.
     * Useful for logging or triggering unban-related actions.
     * @param {SessionId} clientId - The unique session ID of the unbanned client.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @param {PolicyName} policyName - The unique name of the policy.
     */
    onUnbanClient?: (clientId: SessionId, swarmName: SwarmName, policyName: PolicyName) => void;
}
/**
 * Interface representing a policy enforcement mechanism.
 * Manages client bans and validates input/output messages within the swarm.
 */
interface IPolicy {
    /**
     * Checks if a client is currently banned under this policy.
     * @param {SessionId} clientId - The unique session ID of the client to check.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<boolean>} A promise resolving to true if the client is banned, false otherwise.
     * @throws {Error} If the ban status check fails (e.g., due to storage issues).
     */
    hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Retrieves the ban message for a banned client.
     * @param {SessionId} clientId - The unique session ID of the banned client.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<string>} A promise resolving to the ban message for the client.
     * @throws {Error} If retrieving the ban message fails (e.g., due to missing configuration).
     */
    getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;
    /**
     * Validates an incoming message against the policy rules.
     * @param {string} incoming - The incoming message to validate.
     * @param {SessionId} clientId - The unique session ID of the client sending the message.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<boolean>} A promise resolving to true if the input is valid, false otherwise.
     * @throws {Error} If validation fails unexpectedly (e.g., due to internal errors).
     */
    validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Validates an outgoing message against the policy rules.
     * @param {string} outgoing - The outgoing message to validate.
     * @param {SessionId} clientId - The unique session ID of the client receiving the message.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<boolean>} A promise resolving to true if the output is valid, false otherwise.
     * @throws {Error} If validation fails unexpectedly (e.g., due to internal errors).
     */
    validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Bans a client under this policy, adding them to the banned list.
     * @param {SessionId} clientId - The unique session ID of the client to ban.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<void>} A promise that resolves when the client is banned.
     * @throws {Error} If banning the client fails (e.g., due to persistence issues).
     */
    banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
    /**
     * Unbans a client under this policy, removing them from the banned list.
     * @param {SessionId} clientId - The unique session ID of the client to unban.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<void>} A promise that resolves when the client is unbanned.
     * @throws {Error} If unbanning the client fails (e.g., due to persistence issues).
     */
    unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
}
/**
 * Interface representing the schema for configuring a policy.
 * Defines how policies enforce rules and manage bans within the swarm.
 */
interface IPolicySchema {
    /** Optional flag to enable serialization of banned clients to persistent storage (e.g., hard drive). */
    persist?: boolean;
    /** Optional description for documentation purposes, aiding in policy usage understanding. */
    docDescription?: string;
    /** The unique name of the policy within the swarm. */
    policyName: PolicyName;
    /** Optional default message to display when a client is banned, overridden by getBanMessage if provided. */
    banMessage?: string;
    /** Optional flag to automatically ban a client immediately after failed validation. */
    autoBan?: boolean;
    /**
     * Optional function to retrieve a custom ban message for a client.
     * Overrides the default banMessage if provided.
     * @param {SessionId} clientId - The unique session ID of the banned client.
     * @param {PolicyName} policyName - The unique name of the policy.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<string | null> | string | null} The ban message or null, synchronously or asynchronously.
     */
    getBanMessage?: (clientId: SessionId, policyName: PolicyName, swarmName: SwarmName) => Promise<string | null> | string | null;
    /**
     * Retrieves the list of currently banned clients under this policy.
     * @param {PolicyName} policyName - The unique name of the policy.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {SessionId[] | Promise<SessionId[]>} An array of banned session IDs, synchronously or asynchronously.
     */
    getBannedClients?: (policyName: PolicyName, swarmName: SwarmName) => SessionId[] | Promise<SessionId[]>;
    /**
     * Optional function to set the list of banned clients.
     * Overrides default ban list management if provided.
     * @param {SessionId[]} clientIds - An array of session IDs to ban.
     * @param {PolicyName} policyName - The unique name of the policy.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<void> | void} A promise that resolves when the ban list is updated, or void if synchronous.
     * @throws {Error} If updating the ban list fails (e.g., due to persistence issues).
     */
    setBannedClients?: (clientIds: SessionId[], policyName: PolicyName, swarmName: SwarmName) => Promise<void> | void;
    /**
     * Optional function to validate incoming messages against custom policy rules.
     * Overrides default validation if provided.
     * @param {string} incoming - The incoming message to validate.
     * @param {SessionId} clientId - The unique session ID of the client sending the message.
     * @param {PolicyName} policyName - The unique name of the policy.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<boolean> | boolean} True if the input is valid, false otherwise, synchronously or asynchronously.
     */
    validateInput?: (incoming: string, clientId: SessionId, policyName: PolicyName, swarmName: SwarmName) => Promise<boolean> | boolean;
    /**
     * Optional function to validate outgoing messages against custom policy rules.
     * Overrides default validation if provided.
     * @param {string} outgoing - The outgoing message to validate.
     * @param {SessionId} clientId - The unique session ID of the client receiving the message.
     * @param {PolicyName} policyName - The unique name of the policy.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<boolean> | boolean} True if the output is valid, false otherwise, synchronously or asynchronously.
     */
    validateOutput?: (outgoing: string, clientId: SessionId, policyName: PolicyName, swarmName: SwarmName) => Promise<boolean> | boolean;
    /** Optional set of callbacks for policy events, allowing customization of validation and ban actions. */
    callbacks?: IPolicyCallbacks;
}
/**
 * Interface representing the parameters required to initialize a policy.
 * Extends the policy schema with runtime dependencies and full callback support.
 * @extends {IPolicySchema}
 * @extends {IPolicyCallbacks}
 */
interface IPolicyParams extends IPolicySchema, IPolicyCallbacks {
    /** The logger instance for recording policy-related activity and errors. */
    logger: ILogger;
    /** The bus instance for event communication within the swarm. */
    bus: IBus;
}
/**
 * Type representing the unique name of a policy within the swarm.
 * @typedef {string} PolicyName
 */
type PolicyName = string;

/**
 * Interface representing the contextual metadata for an event in the swarm system.
 * Provides optional identifiers for components involved in an event (e.g., agent, swarm, storage), used partially in IBusEvent.context to supply additional context.
 * In ClientAgent, typically only agentName is populated (e.g., context: { agentName }), with other fields available for broader system use (e.g., swarm or policy events).
 */
interface IBusEventContext {
    /**
     * The unique name of the agent associated with the event.
     * Links the event to a specific agent instance (e.g., this.params.agentName in ClientAgent), consistently included in IBusEvent.context.
     * Example: "Agent1" for an agent emitting a "run" event.
     * @type {AgentName}
     */
    agentName: AgentName;
    /**
     * The unique name of the swarm associated with the event.
     * Identifies the swarm context, potentially used in swarm-wide events (e.g., IBus.emit in ISwarmParams), though not observed in ClientAgent.
     * Example: "SwarmA" for a swarm-level navigation event.
     * @type {SwarmName}
     */
    swarmName: SwarmName;
    /**
     * The unique name of the storage associated with the event.
     * Ties the event to a specific storage instance (e.g., IStorage), potentially for storage-related events, unused in ClientAgent’s agent-centric emissions.
     * Example: "Storage1" for a storage upsert event.
     * @type {StorageName}
     */
    storageName: StorageName;
    /**
     * The unique name of the state associated with the event.
     * Links to a specific state instance (e.g., IState), potentially for state change events, not populated in ClientAgent’s context.
     * Example: "StateX" for a state update event.
     * @type {StateName}
     */
    stateName: StateName;
    /**
     * The unique name of the policy associated with the event.
     * Identifies the policy context (e.g., IPolicy), potentially for policy enforcement events (e.g., bans), unused in ClientAgent’s emissions.
     * Example: "PolicyY" for a client ban event.
     * @type {PolicyName}
     */
    policyName: PolicyName;
}
/**
 * Type representing the possible sources of an event in the swarm system.
 * A generic string identifier for the event’s origin, used in IBaseEvent.source and overridden by EventBusSource in IBusEvent for specific bus-related sources.
 * Example: "custom-source" for a generic event, though typically refined by EventBusSource in practice.
 * @typedef {string} EventSource
 */
type EventSource = string;
/**
 * Type representing specific sources of events for the internal bus in the swarm system.
 * Enumerates predefined origins for IBusEvent.source, observed as "agent-bus" in ClientAgent (e.g., bus.emit calls), with other values likely used in corresponding components (e.g., "history-bus" in IHistory).
 * @typedef {"agent-bus" | "history-bus" | "session-bus" | "state-bus" | "storage-bus" | "swarm-bus" | "execution-bus" | "policy-bus"} EventBusSource
 */
type EventBusSource = "agent-bus" | "history-bus" | "session-bus" | "state-bus" | "storage-bus" | "swarm-bus" | "execution-bus" | "policy-bus";
/**
 * Interface representing the base structure of an event in the swarm system.
 * Defines the minimal required fields for all events, extended by IBusEvent and ICustomEvent for specific use cases, and used generically in IBus.emit<T>.
 * Provides a foundation for event-driven communication across components like agents, sessions, and swarms.
 */
interface IBaseEvent {
    /**
     * The source of the event, identifying its origin within the system.
     * A generic string (EventSource) in IBaseEvent, overridden by EventBusSource in IBusEvent (e.g., "agent-bus" in ClientAgent).
     * Example: "custom-source" for a basic event, or "agent-bus" in practice.
     * @type {EventSource}
     */
    source: EventSource;
    /**
     * The unique identifier of the client targeted by the event.
     * Matches the clientId used in runtime params (e.g., this.params.clientId in ClientAgent), ensuring events reach the intended session or agent instance.
     * Example: "client-123" for a user session receiving an "emit-output" event.
     * @type {string}
     */
    clientId: string;
}
/**
 * Interface representing a structured event for the internal bus in the swarm system.
 * Extends IBaseEvent with a specific schema, used extensively in ClientAgent’s bus.emit calls (e.g., "run", "commit-user-message") to notify the system of actions, outputs, or state changes.
 * Dispatched via IBus.emit<IBusEvent> to broadcast detailed, agent-driven events with input/output data and context.
 */
interface IBusEvent extends Omit<IBaseEvent, keyof {
    source: never;
}> {
    /**
     * The specific source of the event, restricted to EventBusSource values.
     * Identifies the component emitting the event, consistently "agent-bus" in ClientAgent (e.g., RUN_FN, _emitOutput), with other values for other buses (e.g., "history-bus").
     * Example: "agent-bus" for an agent’s "emit-output" event.
     * @type {EventBusSource}
     */
    source: EventBusSource;
    /**
     * The type of the event, defining its purpose or action.
     * A string identifier unique to the event’s intent, observed in ClientAgent as "run", "emit-output", "commit-user-message", etc.
     * Example: "commit-tool-output" for a tool execution result.
     * @type {string}
     */
    type: string;
    /**
     * The input data for the event, as a key-value object.
     * Carries event-specific input (e.g., { message } in "commit-user-message", { mode, rawResult } in "emit-output" from ClientAgent), often tied to IModelMessage content.
     * Example: { toolId: "tool-xyz", content: "result" } for a tool output event.
     * @type {Record<string, any>}
     */
    input: Record<string, any>;
    /**
     * The output data for the event, as a key-value object.
     * Contains event-specific results (e.g., { result } in "run" or "emit-output" from ClientAgent), often empty {} for notifications (e.g., "commit-flush").
     * Example: { result: "processed data" } for an execution output.
     * @type {Record<string, any>}
     */
    output: Record<string, any>;
    /**
     * The contextual metadata for the event, partially implementing IBusEventContext.
     * Typically includes only agentName in ClientAgent (e.g., { agentName: this.params.agentName }), with other fields optional for broader use cases.
     * Example: { agentName: "Agent1" } for an agent-driven event.
     * @type {Partial<IBusEventContext>}
     */
    context: Partial<IBusEventContext>;
}
/**
 * Interface representing a custom event with a flexible payload in the swarm system.
 * Extends IBaseEvent for generic event handling, allowing arbitrary data via payload, though not directly observed in ClientAgent (which uses IBusEvent).
 * Likely used for bespoke event scenarios outside the structured IBusEvent schema, dispatched via IBus.emit<ICustomEvent>.
 */
interface ICustomEvent<T extends any = any> extends IBaseEvent {
    /**
     * The optional payload of the event, carrying custom data of any type.
     * Provides flexibility for event-specific information, unlike IBusEvent’s rigid input/output structure, potentially for user-defined events.
     * Example: { status: "complete", data: 42 } for a custom completion event.
     * @type {T | undefined}
     * @template T - The type of the payload, defaulting to any for maximum flexibility.
     */
    payload?: T;
}

/**
 * Interface representing an event bus for the swarm system.
 * Provides a mechanism for asynchronous, client-targeted event dispatching, primarily used by agents (e.g., ClientAgent) to broadcast operational updates, lifecycle changes, and outputs to the system.
 * Integrated into runtime parameters (e.g., IAgentParams, ISessionParams), the bus ensures decoupled communication between components, such as notifying clients of message commits, tool outputs, or execution results.
 */
interface IBus {
    /**
     * Emits a structured event to a specific client within the swarm system.
     * Asynchronously dispatches events to the designated `clientId`, enabling agents to notify the system of actions like message commits, tool executions, or output emissions.
     * Events follow a consistent schema extending IBaseEvent, including `type` (event identifier), `source` (originator, typically "agent-bus"), `input` (input data), `output` (result data), `context` (metadata with agentName), and `clientId` (redundant target ID).
     *
     * **Observed Behavior (from ClientAgent):**
     * - **Event Dispatch**: Events are emitted after significant actions, such as completing a stateless run (`"run"`), emitting validated output (`"emit-output"`), or committing messages/tools (`"commit-*"`).
     * - **Structure**: Every event includes a fixed set of fields, e.g.:
     *   ```javascript
     *   await this.params.bus.emit<IBusEvent>(this.params.clientId, {
     *     type: "commit-user-message",
     *     source: "agent-bus",
     *     input: { message },
     *     output: {},
     *     context: { agentName: this.params.agentName },
     *     clientId: this.params.clientId,
     *   });
     *   ```
     *   This notifies the system of a user message commit, with no output expected.
     * - **Asynchronous Delivery**: Returns a promise, implying events are queued or sent over a channel (e.g., network, in-memory queue), resolving when dispatched.
     * - **Client Targeting**: Always targets the client’s session ID (e.g., `this.params.clientId`), ensuring precise delivery to the intended recipient.
     * - **Notification Focus**: Primarily used for one-way notifications (e.g., history updates, tool stops), with `output` often empty unless carrying results (e.g., `"run"`, `"emit-output"`).
     *
     * **Example Usage in ClientAgent:**
     * - **Stateless Completion**:
     *   ```javascript
     *   await this.params.bus.emit<IBusEvent>(this.params.clientId, {
     *     type: "run",
     *     source: "agent-bus",
     *     input: { message },
     *     output: { result },
     *     context: { agentName: this.params.agentName },
     *     clientId: this.params.clientId,
     *   });
     *   ```
     *   Signals a completed stateless run with the transformed result.
     * - **Output Emission**:
     *   ```javascript
     *   await this.params.bus.emit<IBusEvent>(this.params.clientId, {
     *     type: "emit-output",
     *     source: "agent-bus",
     *     input: { mode, rawResult },
     *     output: { result },
     *     context: { agentName: this.params.agentName },
     *     clientId: this.params.clientId,
     *   });
     *   ```
     *   Broadcasts the final output after validation.
     *
     * **Key Characteristics:**
     * - **Redundancy**: The `clientId` in the event mirrors the emit target, aiding downstream filtering or validation.
     * - **Type Safety**: Generic `<T>` ensures events conform to IBaseEvent extensions (e.g., IBusEvent), supporting structured payloads.
     * - **Integration**: Paired with history updates (e.g., `history.push`) and callbacks (e.g., `onOutput`), amplifying system-wide awareness.
     *
     * @template T - The type of event, extending IBaseEvent, defining a structured payload with fields like `type`, `source`, `input`, `output`, `context`, and `clientId`.
     * @param {string} clientId - The unique identifier of the client to receive the event, typically the session ID from runtime params (e.g., `this.params.clientId` in ClientAgent).
     * @param {T} event - The event object to emit, a structured payload with mandatory fields (e.g., `{ type: "run", source: "agent-bus", input: { message } }`) specific to the action being notified.
     * @returns {Promise<void>} A promise that resolves when the event is successfully dispatched to the client’s event handling system, indicating completion of the emission process.
     * @throws {Error} If emission fails, potentially due to invalid `clientId`, malformed event structure, or delivery issues (e.g., queue overflow, network failure).
     */
    emit<T extends IBaseEvent>(clientId: string, event: T): Promise<void>;
}

/**
 * Interface representing callbacks for session-related events within a swarm.
 * Provides hooks for connection, execution, and emission events.
 */
interface ISwarmSessionCallbacks {
    /**
     * Optional callback triggered when a client connects to the swarm.
     * Useful for logging or initialization tasks.
     * @param {string} clientId - The unique ID of the client connecting.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     */
    onConnect?: (clientId: string, swarmName: SwarmName) => void;
    /**
     * Optional callback triggered when a command is executed within the swarm.
     * @param {string} clientId - The unique ID of the client executing the command.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @param {string} content - The content of the command to execute.
     * @param {ExecutionMode} mode - The source of execution ("tool" or "user").
     */
    onExecute?: (clientId: string, swarmName: SwarmName, content: string, mode: ExecutionMode) => void;
    /**
     * Optional callback triggered when a stateless completion run is executed.
     * @param {string} clientId - The unique ID of the client initiating the run.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @param {string} content - The content to process statelessly.
     */
    onRun?: (clientId: string, swarmName: SwarmName, content: string) => void;
    /**
     * Optional callback triggered when a message is emitted from the swarm.
     * @param {string} clientId - The unique ID of the client associated with the emission.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @param {string} message - The message content being emitted.
     */
    onEmit?: (clientId: string, swarmName: SwarmName, message: string) => void;
    /**
     * Optional callback triggered when a session is initialized within the swarm.
     * @param {string} clientId - The unique ID of the client associated with the session.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     */
    onInit?: (clientId: string, swarmName: SwarmName) => void;
    /**
     * Optional callback triggered when a session is disconnected or disposed of.
     * Note: "disponnected" in original comment corrected to "disconnected".
     * @param {string} clientId - The unique ID of the client associated with the session.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     */
    onDispose?: (clientId: string, swarmName: SwarmName) => void;
}
/**
 * Interface representing lifecycle callbacks for an initialized swarm.
 * Extends session callbacks with agent-specific navigation events.
 * @extends {ISwarmSessionCallbacks}
 */
interface ISwarmCallbacks extends ISwarmSessionCallbacks {
    /**
     * Callback triggered when the active agent changes within the swarm.
     * Useful for navigation tracking or state updates.
     * @param {string} clientId - The unique ID of the client associated with the change.
     * @param {AgentName} agentName - The name of the new active agent.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<void>} A promise that resolves when the agent change is processed.
     */
    onAgentChanged: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void>;
}
/**
 * Interface representing the parameters required to initialize a swarm.
 * Extends the swarm schema (excluding certain fields) with runtime dependencies.
 * @extends {Omit<ISwarmSchema, "agentList" | "onAgentChanged">}
 */
interface ISwarmParams extends Omit<ISwarmSchema, keyof {
    agentList: never;
    onAgentChanged: never;
}> {
    /** The unique identifier of the client initializing the swarm. */
    clientId: string;
    /** The logger instance for recording swarm-related activity and errors. */
    logger: ILogger;
    /** The bus instance for event communication within the swarm. */
    bus: IBus;
    /** A map of agent names to their corresponding agent instances for runtime access. */
    agentMap: Record<AgentName, IAgent>;
}
/**
 * Interface representing the schema for defining a swarm.
 * Configures the swarm's behavior, navigation, and agent management.
 */
interface ISwarmSchema {
    /** Optional flag to enable serialization of navigation stack and active agent state to persistent storage (e.g., hard drive). */
    persist?: boolean;
    /** Optional description for documentation purposes, aiding in swarm usage understanding. */
    docDescription?: string;
    /** Optional array of policy names defining banhammer or access control rules for the swarm. */
    policies?: PolicyName[];
    /**
     * Optional function to retrieve the initial navigation stack after swarm initialization.
     * @param {string} clientId - The unique ID of the client requesting the stack.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<AgentName[]> | AgentName[]} The navigation stack, synchronously or asynchronously.
     */
    getNavigationStack?: (clientId: string, swarmName: SwarmName) => Promise<AgentName[]> | AgentName[];
    /**
     * Optional function to persist the navigation stack after a change.
     * @param {string} clientId - The unique ID of the client updating the stack.
     * @param {AgentName[]} navigationStack - The updated navigation stack.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<void>} A promise that resolves when the stack is persisted.
     * @throws {Error} If persistence fails (e.g., due to storage issues).
     */
    setNavigationStack?: (clientId: string, navigationStack: AgentName[], swarmName: SwarmName) => Promise<void>;
    /**
     * Optional function to fetch the active agent upon swarm initialization.
     * @param {string} clientId - The unique ID of the client requesting the agent.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @param {AgentName} defaultAgent - The default agent name to fall back to if no active agent is set.
     * @returns {Promise<AgentName> | AgentName} The name of the active agent, synchronously or asynchronously.
     */
    getActiveAgent?: (clientId: string, swarmName: SwarmName, defaultAgent: AgentName) => Promise<AgentName> | AgentName;
    /**
     * Optional function to update the active agent after navigation changes.
     * @param {string} clientId - The unique ID of the client updating the agent.
     * @param {AgentName} agentName - The name of the new active agent.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<void> | void} A promise that resolves when the agent is updated, or void if synchronous.
     * @throws {Error} If the update fails (e.g., due to persistence issues).
     */
    setActiveAgent?: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void> | void;
    /** The default agent name to use when no active agent is specified. */
    defaultAgent: AgentName;
    /** The unique name of the swarm within the system. */
    swarmName: string;
    /** The list of agent names available within the swarm. */
    agentList: string[];
    /** Optional partial set of lifecycle callbacks for the swarm, allowing customization of events. */
    callbacks?: Partial<ISwarmCallbacks>;
}
/**
 * Interface representing a swarm of agents.
 * Provides methods for navigation, agent management, and output handling.
 */
interface ISwarm {
    /**
     * Removes and returns the most recent agent from the navigation stack, or falls back to the default agent.
     * @returns {Promise<AgentName>} A promise resolving to the agent name popped from the stack or the default agent.
     * @throws {Error} If navigation retrieval fails (e.g., due to persistence issues).
     */
    navigationPop(): Promise<AgentName>;
    /**
     * Cancels the current output operation, resulting in an empty string from waitForOutput.
     * @returns {Promise<void>} A promise that resolves when the output is canceled.
     * @throws {Error} If cancellation fails (e.g., due to internal errors).
     */
    cancelOutput(): Promise<void>;
    /**
     * Waits for and retrieves the output from the swarm’s active agent.
     * @returns {Promise<string>} A promise resolving to the output string from the swarm.
     * @throws {Error} If no output is available or waiting times out.
     */
    waitForOutput(): Promise<string>;
    /**
     * Retrieves the name of the currently active agent in the swarm.
     * @returns {Promise<AgentName>} A promise resolving to the name of the active agent.
     * @throws {Error} If the active agent cannot be determined (e.g., due to persistence issues).
     */
    getAgentName(): Promise<AgentName>;
    /**
     * Retrieves the instance of the currently active agent in the swarm.
     * @returns {Promise<IAgent>} A promise resolving to the active agent instance.
     * @throws {Error} If the agent instance cannot be retrieved (e.g., due to invalid agent name).
     */
    getAgent(): Promise<IAgent>;
    /**
     * Registers or updates an agent reference in the swarm’s agent map.
     * @param {AgentName} agentName - The name of the agent to register.
     * @param {IAgent} agent - The agent instance to associate with the name.
     * @returns {Promise<void>} A promise that resolves when the agent reference is set.
     * @throws {Error} If registration fails (e.g., due to invalid agent or internal errors).
     */
    setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
    /**
     * Sets the active agent in the swarm by name, updating navigation if applicable.
     * @param {AgentName} agentName - The name of the agent to set as active.
     * @returns {Promise<void>} A promise that resolves when the active agent is updated.
     * @throws {Error} If setting the agent fails (e.g., due to persistence issues or invalid name).
     */
    setAgentName(agentName: AgentName): Promise<void>;
    /**
     * Emits a message to the session's communication channel.
     * @param {string} message - The message content to emit.
     * @returns {Promise<void>} A promise that resolves when the message is successfully emitted.
     * @throws {Error} If the emission fails due to connection issues or invalid message format.
     */
    emit(message: string): Promise<void>;
}
/**
 * Type representing the unique name of a swarm within the system.
 * @typedef {string} SwarmName
 */
type SwarmName = string;

/**
 * Interface representing the parameters required to create a session.
 * Combines session schema, swarm callbacks, and runtime dependencies.
 * @extends {ISessionSchema}
 * @extends {ISwarmSessionCallbacks}
 */
interface ISessionParams extends ISessionSchema, ISwarmSessionCallbacks {
    /** The unique ID of the client associated with the session. */
    clientId: string;
    /** The logger instance for recording session activity and errors. */
    logger: ILogger;
    /** The policy instance defining session rules and constraints. */
    policy: IPolicy;
    /** The bus instance for event communication within the swarm. */
    bus: IBus;
    /** The swarm instance managing the session. */
    swarm: ISwarm;
    /** The unique name of the swarm this session belongs to. */
    swarmName: SwarmName;
}
/**
 * Interface representing the schema for session data.
 * Currently empty, serving as a placeholder for future session-specific configuration.
 */
interface ISessionSchema {
}
/**
 * Type representing a function for sending messages.
 * @template T - The return type of the send operation, defaults to void.
 * @param {IOutgoingMessage} outgoing - The outgoing message to send.
 * @returns {Promise<T> | T} A promise resolving to the result of the send operation, or the result directly.
 */
type SendMessageFn<T = void> = (outgoing: IOutgoingMessage) => Promise<T>;
/**
 * Type representing a function for receiving messages.
 * @template T - The return type of the receive operation, defaults to void.
 * @param {IIncomingMessage} incoming - The incoming message to process.
 * @returns {Promise<T> | T} A promise resolving to the result of the receive operation, or the result directly.
 */
type ReceiveMessageFn<T = void> = (incoming: IIncomingMessage) => Promise<T>;
/**
 * Interface representing a session within the swarm.
 * Defines methods for message emission, execution, and state management.
 */
interface ISession {
    /**
     * Emits a message to the session's communication channel.
     * @param {string} message - The message content to emit.
     * @returns {Promise<void>} A promise that resolves when the message is successfully emitted.
     * @throws {Error} If the emission fails due to connection issues or invalid message format.
     */
    emit(message: string): Promise<void>;
    /**
     * Runs a stateless completion without modifying the session's chat history.
     * Useful for one-off computations or previews.
     * @param {string} content - The content to process statelessly.
     * @returns {Promise<string>} A promise resolving to the output of the completion.
     * @throws {Error} If the execution fails due to invalid content or internal errors.
     */
    run(content: string): Promise<string>;
    /**
     * Executes a command within the session, potentially updating history based on mode.
     * @param {string} content - The content to execute.
     * @param {ExecutionMode} mode - The source of execution ("tool" or "user").
     * @returns {Promise<string>} A promise resolving to the output of the execution.
     * @throws {Error} If the execution fails due to invalid content, mode, or internal errors.
     */
    execute(content: string, mode: ExecutionMode): Promise<string>;
    /**
     * Connects the session to a message sender and returns a receiver function.
     * Establishes a bidirectional communication channel.
     * @param {SendMessageFn} connector - The function to send outgoing messages.
     * @param {...unknown[]} args - Additional arguments for connector setup (implementation-specific).
     * @returns {ReceiveMessageFn<string>} A function to handle incoming messages, returning a string result.
     * @throws {Error} If the connection fails or the connector is invalid.
     */
    connect(connector: SendMessageFn, ...args: unknown[]): ReceiveMessageFn<string>;
    /**
     * Commits tool output to the session's history or state.
     * @param {string} toolId - The unique `tool_call_id` for tracking in OpenAI-style history.
     * @param {string} content - The output content from the tool.
     * @returns {Promise<void>} A promise that resolves when the output is committed.
     * @throws {Error} If the tool ID is invalid or committing fails.
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Commits an assistant message to the session's history without triggering a response.
     * @param {string} message - The assistant message content to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     * @throws {Error} If committing the message fails.
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Commits a user message to the session's history without triggering a response.
     * @param {string} message - The user message content to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     * @throws {Error} If committing the message fails.
     */
    commitUserMessage: (message: string, mode: ExecutionMode) => Promise<void>;
    /**
     * Commits a flush operation to clear the session's agent history.
     * Resets the history to an initial state.
     * @returns {Promise<void>} A promise that resolves when the history is flushed.
     * @throws {Error} If flushing the history fails.
     */
    commitFlush: () => Promise<void>;
    /**
     * Prevents the next tool in the execution sequence from running.
     * Stops further tool calls within the session.
     * @returns {Promise<void>} A promise that resolves when the stop is committed.
     * @throws {Error} If stopping the tools fails.
     */
    commitStopTools: () => Promise<void>;
    /**
     * Commits a system message to the session's history or state.
     * @param {string} message - The system message content to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     * @throws {Error} If committing the message fails.
     */
    commitSystemMessage(message: string): Promise<void>;
}
/**
 * Type representing the unique identifier for a session.
 * @typedef {string} SessionId
 */
type SessionId = string;
/**
 * Type representing the operational mode of a session.
 * Defines the session's behavior: full session, connection setup, or single completion.
 * @typedef {"session" | "makeConnection" | "complete"} SessionMode
 */
type SessionMode = "session" | "makeConnection" | "complete";
/**
 * Type representing the source of execution within a session.
 * Tools emit "tool" messages (ignored in user history), while users emit "user" messages.
 * @typedef {"tool" | "user"} ExecutionMode
 */
type ExecutionMode = "tool" | "user";

/**
 * Interface representing a tool call request within the swarm system.
 * Encapsulates a specific invocation of a tool as requested by the model, used in agent workflows (e.g., ClientAgent) to bridge model outputs to executable actions.
 * Appears in IModelMessage.tool_calls (e.g., via ICompletion.getCompletion) and is processed by agents to execute tools, emit events (e.g., IBus.emit "commit-tool-output"), and update history (e.g., IHistory.push).
 */
interface IToolCall {
    /**
     * The unique identifier of the tool call.
     * Assigned to distinguish this invocation from others, often generated randomly (e.g., randomString() in ClientAgent.mapToolCalls) or provided by the model.
     * Used to correlate tool outputs back to their requests (e.g., tool_call_id in IModelMessage).
     * Example: "tool-xyz123" for a specific call in EXECUTE_FN.
     * @type {string}
     */
    id: string;
    /**
     * The type of the tool being called, currently fixed to "function".
     * Indicates that the tool is a callable function, aligning with the swarm’s function-based tool model (e.g., ClientAgent.createToolCall).
     * Future extensions might support other types, but "function" is the only supported value as observed.
     * @type {"function"}
     */
    type: "function";
    /**
     * The function details specifying the tool to be executed.
     * Defines the name and arguments of the function to invoke, derived from model outputs (e.g., ICompletion.getCompletion in ClientAgent).
     * Processed by agents to match against ITool definitions and execute via callbacks (e.g., targetFn.call).
     */
    function: {
        /**
         * The name of the function to be called.
         * Identifies the specific tool function (e.g., "search" or "calculate") requested by the model, matched against ITool.function.name in ClientAgent.
         * Example: "search" for a search tool invoked in EXECUTE_FN.
         * @type {string}
         */
        name: string;
        /**
         * The arguments to be passed to the function, as a key-value object.
         * Contains the parameters provided by the model for the tool call, validated and executed in ClientAgent (e.g., targetFn.validate, targetFn.call).
         * Example: `{ query: "example" }` for a search tool’s input.
         * @type {{ [key: string]: any }}
         */
        arguments: {
            [key: string]: any;
        };
    };
}
/**
 * Interface representing a tool definition within the swarm system.
 * Defines the metadata and schema for a callable tool, used by agents (e.g., ClientAgent) to provide the model with available functions and validate/execute tool calls.
 * Integrated into IAgentParams.tools and passed to ICompletion.getCompletion, enabling the model to generate IToolCall requests based on this specification.
 */
interface ITool {
    /**
     * The type of the tool, typically "function" in the current system.
     * Specifies the tool’s category, aligning with IToolCall.type, though only "function" is observed in ClientAgent usage (e.g., params.tools).
     * Future extensions might include other types (e.g., "api", "script"), but "function" is standard.
     * @type {string}
     */
    type: string;
    /**
     * The function details defining the tool’s capabilities.
     * Provides the name, description, and parameter schema for the tool, used by the model to understand and invoke it (e.g., in ClientAgent.getCompletion).
     * Matched against IToolCall.function during execution (e.g., EXECUTE_FN’s targetFn lookup).
     */
    function: {
        /**
         * The name of the function, uniquely identifying the tool.
         * Must match IToolCall.function.name for execution (e.g., "search" in ClientAgent.tools), serving as the key for tool lookup and invocation.
         * Example: "calculate" for a math tool.
         * @type {string}
         */
        name: string;
        /**
         * A human-readable description of the function’s purpose.
         * Informs the model or users about the tool’s functionality (e.g., "Performs a search query"), used in tool selection or documentation.
         * Not directly executed but critical for model understanding in ClientAgent workflows.
         * @type {string}
         */
        description: string;
        /**
         * The schema defining the parameters required by the function.
         * Specifies the structure, types, and constraints of arguments (e.g., IToolCall.function.arguments), validated in ClientAgent (e.g., targetFn.validate).
         * Provides the model with a blueprint for generating valid tool calls.
         */
        parameters: {
            /**
             * The type of the parameters object, typically "object".
             * Indicates that parameters are a key-value structure, as expected by IToolCall.function.arguments in ClientAgent.
             * Example: "object" for a standard JSON-like parameter set.
             * @type {string}
             */
            type: string;
            /**
             * An array of parameter names that are mandatory for the function.
             * Lists keys that must be present in IToolCall.function.arguments, enforced during validation (e.g., ClientAgent.targetFn.validate).
             * Example: ["query"] for a search tool requiring a query string.
             * @type {string[]}
             */
            required: string[];
            /**
             * A key-value map defining the properties of the parameters.
             * Details each argument’s type, description, and optional constraints, guiding the model and agent in constructing and validating tool calls (e.g., in ClientAgent.EXECUTE_FN).
             */
            properties: {
                [key: string]: {
                    /**
                     * The data type of the parameter property (e.g., "string", "number").
                     * Specifies the expected type for validation (e.g., ClientAgent.targetFn.validate), ensuring compatibility with IToolCall.function.arguments.
                     * Example: "string" for a query parameter.
                     * @type {string}
                     */
                    type: string;
                    /**
                     * A description of the parameter property’s purpose.
                     * Provides context for the model or users (e.g., "The search term to query"), not executed but used for tool comprehension.
                     * Example: "The value to search for" for a query parameter.
                     * @type {string}
                     */
                    description: string;
                    /**
                     * An optional array of allowed values for the parameter, if constrained.
                     * Defines an enumeration of valid options, checked during validation (e.g., ClientAgent.targetFn.validate) to restrict input.
                     * Example: ["asc", "desc"] for a sort direction parameter.
                     * @type {string[] | undefined}
                     */
                    enum?: string[];
                };
            };
        };
    };
}

/**
 * Interface representing a model message within the swarm system.
 * Encapsulates a single message exchanged between agents, tools, users, or the system, used extensively in agent workflows (e.g., ClientAgent) for history tracking, completion generation, and event emission.
 * Messages are stored in history (e.g., via IHistory.push), generated by completions (e.g., ICompletion.getCompletion), and emitted via the bus (e.g., IBus.emit), serving as the core data structure for communication and state management.
 */
interface IModelMessage<Payload extends object = object> {
    /**
     * The role of the message sender, defining its origin or purpose in the conversation flow.
     * Observed in ClientAgent usage:
     * - `"assistant"`: Generated by the model (e.g., getCompletion output, commitAssistantMessage).
     * - `"system"`: System-level notifications (e.g., commitSystemMessage).
     * - `"tool"`: Tool outputs or tool-related messages (e.g., commitToolOutput, resurrection prompts).
     * - `"user"`: User-initiated messages (e.g., commitUserMessage, EXECUTE_FN input).
     * - `"resque"`: Error recovery messages during model resurrection (e.g., _resurrectModel).
     * - `"flush"`: Markers for history resets (e.g., commitFlush).
     * @type {"assistant" | "system" | "tool" | "user" | "resque" | "flush"}
     */
    role: "assistant" | "system" | "tool" | "user" | "resque" | "flush";
    /**
     * The name of the agent associated with the message.
     * Links the message to a specific agent instance (e.g., this.params.agentName in ClientAgent), ensuring context within multi-agent swarms.
     * Used consistently in history pushes and bus events (e.g., context.agentName in IBus.emit).
     * @type {string}
     */
    agentName: string;
    /**
     * The content of the message, representing the primary data or text being communicated.
     * Examples from ClientAgent:
     * - User input (e.g., incoming in execute).
     * - Tool output (e.g., content in commitToolOutput).
     * - Model response (e.g., result from getCompletion).
     * - Error reasons or placeholders (e.g., _resurrectModel).
     * May be empty (e.g., "" in flush messages) or trimmed for consistency.
     * @type {string}
     */
    content: string;
    /**
     * The execution mode indicating the source or context of the message.
     * Aligns with ExecutionMode ("user" or "tool") from Session.interface:
     * - `"user"`: Messages from user input or stateless runs (e.g., commitUserMessage, RUN_FN).
     * - `"tool"`: Messages from tool outputs or system actions (e.g., commitToolOutput, _resurrectModel).
     * Drives processing logic, such as validation or tool call handling in ClientAgent.
     * @type {ExecutionMode}
     */
    mode: ExecutionMode;
    /**
     * Optional array of tool calls associated with the message, present when the model requests tool execution.
     * Populated in getCompletion responses (e.g., ClientAgent EXECUTE_FN), mapped to IToolCall objects for execution.
     * Example: `{ function: { name: "func", arguments: { key: "value" } }, id: "tool-id" }`.
     * Absent in user, system, or tool output messages unless explicitly triggered by the model.
     * @type {IToolCall[] | undefined}
     */
    tool_calls?: IToolCall[];
    images?: Uint8Array[] | string[];
    /**
     * Optional identifier of the tool call this message responds to, linking tool outputs to their requests.
     * Set in tool-related messages (e.g., commitToolOutput in ClientAgent) to correlate with a prior tool_calls entry.
     * Example: `tool_call_id: "tool-id"` ties a tool’s output to its originating call.
     * Undefined for non-tool-response messages (e.g., user input, assistant responses without tools).
     * @type {string | undefined}
     */
    tool_call_id?: string;
    /**
     * Optional payload data attached to the message, providing additional context or metadata.
     * Can be an object of any shape or `null` if no payload is needed; undefined if not present.
     * Example: `{ image_id: <uuid> }` when user send a message
     * @type {Payload | null | undefined}
     */
    payload?: Payload | null;
}

/**
 * Represents an identifier for an entity, which can be either a string or a number.
 * Used across persistence classes to uniquely identify stored entities such as agents, states, or memory records.
 * @typedef {string | number} EntityId
 */
type EntityId = string | number;
/**
 * Base interface for all persistent entities in the swarm system.
 * Extended by specific entity types (e.g., `IPersistAliveData`, `IPersistStateData`) to define their structure.
 * @interface IEntity
 */
interface IEntity {
}
/** @private Symbol for memoizing the wait-for-initialization operation in PersistBase */
declare const BASE_WAIT_FOR_INIT_SYMBOL: unique symbol;
/** @private Symbol for creating a new key in a persistent list */
declare const LIST_CREATE_KEY_SYMBOL: unique symbol;
/** @private Symbol for getting the last key in a persistent list */
declare const LIST_GET_LAST_KEY_SYMBOL: unique symbol;
/** @private Symbol for popping the last item from a persistent list */
declare const LIST_POP_SYMBOL: unique symbol;
/**
 * Defines the core interface for persistent storage operations in the swarm system.
 * Provides methods for managing entities stored as JSON files in the file system, used across swarm utilities.
 * @template Entity - The type of entity stored, defaults to `IEntity` (e.g., `IPersistAliveData`, `IPersistStateData`).
 * @interface IPersistBase
 */
interface IPersistBase<Entity extends IEntity = IEntity> {
    /**
     * Initializes the storage directory, creating it if needed and validating existing data by removing invalid entities.
     * Ensures the persistence layer is ready for use, handling corrupt files during setup.
     * @param {boolean} initial - Indicates if this is the initial setup; affects memoization behavior for efficiency.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     * @throws {Error} If directory creation, file access, or validation fails.
     */
    waitForInit(initial: boolean): Promise<void>;
    /**
     * Reads an entity from persistent storage by its ID, parsing it from a JSON file.
     * Used to retrieve persisted data such as agent states, memory, or alive status.
     * @param {EntityId} entityId - The identifier of the entity to read (string or number), unique within its storage context.
     * @returns {Promise<Entity>} A promise resolving to the entity data.
     * @throws {Error} If the entity is not found (`ENOENT`) or reading/parsing fails (e.g., invalid JSON).
     */
    readValue(entityId: EntityId): Promise<Entity>;
    /**
     * Checks if an entity exists in persistent storage by its ID.
     * Useful for conditional operations without reading the full entity (e.g., checking session memory existence).
     * @param {EntityId} entityId - The identifier of the entity to check (string or number), unique within its storage context.
     * @returns {Promise<boolean>} A promise resolving to `true` if the entity exists, `false` otherwise.
     * @throws {Error} If checking existence fails for reasons other than the entity not existing.
     */
    hasValue(entityId: EntityId): Promise<boolean>;
    /**
     * Writes an entity to persistent storage with the specified ID, serializing it to JSON.
     * Uses atomic writes to ensure data integrity, critical for reliable state persistence across swarm operations.
     * @param {EntityId} entityId - The identifier for the entity (string or number), unique within its storage context.
     * @param {Entity} entity - The entity data to persist (e.g., `{ online: true }` for alive status).
     * @returns {Promise<void>} A promise that resolves when the write operation is complete.
     * @throws {Error} If writing to the file system fails (e.g., permissions or disk issues).
     */
    writeValue(entityId: EntityId, entity: Entity): Promise<void>;
}
/**
 * Defines a constructor type for creating `PersistBase` instances, parameterized by entity name and type.
 * Enables customization of persistence behavior through subclassing or adapter injection (e.g., for swarm or state persistence).
 * @template EntityName - The type of entity name (e.g., `SwarmName`, `SessionId`), defaults to `string`.
 * @template Entity - The type of entity (e.g., `IPersistAliveData`), defaults to `IEntity`.
 * @typedef {new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>} TPersistBaseCtor
 */
type TPersistBaseCtor<EntityName extends string = string, Entity extends IEntity = IEntity> = new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>;
/**
 * Base class for persistent storage of entities in the swarm system, using the file system.
 * Provides foundational methods for reading, writing, and managing entities as JSON files, supporting swarm utilities like `PersistAliveUtils`.
 * @template EntityName - The type of entity name (e.g., `SwarmName`, `SessionId`), defaults to `string`, used as a subdirectory.
 * @implements {IPersistBase}
 */
declare const PersistBase: {
    new <EntityName extends string = string>(entityName: EntityName, baseDir?: string): {
        /** @private The directory path where entity files are stored (e.g., `./logs/data/alive/` for alive status) */
        _directory: string;
        readonly entityName: EntityName;
        readonly baseDir: string;
        /**
         * Computes the full file path for an entity based on its ID.
         * @private
         * @param {EntityId} entityId - The identifier of the entity (string or number), unique within the entity type’s storage.
         * @returns {string} The full file path (e.g., `./logs/data/alive/<entityId>.json`).
         */
        _getFilePath(entityId: EntityId): string;
        /**
         * Initializes the storage directory, creating it if it doesn’t exist, and validates existing entities.
         * Removes invalid JSON files during initialization to ensure data integrity (e.g., for `SwarmName`-based alive status).
         * @param {boolean} initial - Indicates if this is the initial setup; reserved for future caching or optimization logic.
         * @returns {Promise<void>} A promise that resolves when initialization is complete.
         * @throws {Error} If directory creation or entity validation fails (e.g., permissions or I/O errors).
         */
        waitForInit(initial: boolean): Promise<void>;
        /**
         * Retrieves the number of entities stored in the directory.
         * Counts only files with a `.json` extension, useful for monitoring storage usage (e.g., active sessions).
         * @returns {Promise<number>} A promise resolving to the count of stored entities.
         * @throws {Error} If reading the directory fails (e.g., permissions or directory not found).
         */
        getCount(): Promise<number>;
        /**
         * Reads an entity from storage by its ID, parsing it from a JSON file.
         * Core method for retrieving persisted data (e.g., alive status for a `SessionId` in a `SwarmName` context).
         * @template T - The specific type of the entity (e.g., `IPersistAliveData`), defaults to `IEntity`.
         * @param {EntityId} entityId - The identifier of the entity to read (string or number), unique within its storage context.
         * @returns {Promise<T>} A promise resolving to the parsed entity data.
         * @throws {Error} If the file is not found (`ENOENT`) or parsing fails (e.g., invalid JSON).
         */
        readValue<T extends IEntity = IEntity>(entityId: EntityId): Promise<T>;
        /**
         * Checks if an entity exists in storage by its ID.
         * Efficiently verifies presence without reading the full entity (e.g., checking if a `SessionId` has memory).
         * @param {EntityId} entityId - The identifier of the entity to check (string or number), unique within its storage context.
         * @returns {Promise<boolean>} A promise resolving to `true` if the entity exists, `false` otherwise.
         * @throws {Error} If checking existence fails for reasons other than the file not existing.
         */
        hasValue(entityId: EntityId): Promise<boolean>;
        /**
         * Writes an entity to storage with the specified ID, serializing it to JSON.
         * Uses atomic file writing via `writeFileAtomic` to ensure data integrity (e.g., persisting `AgentName` for a `SwarmName`).
         * @template T - The specific type of the entity (e.g., `IPersistActiveAgentData`), defaults to `IEntity`.
         * @param {EntityId} entityId - The identifier for the entity (string or number), unique within its storage context.
         * @param {T} entity - The entity data to persist (e.g., `{ agentName: "agent1" }`).
         * @returns {Promise<void>} A promise that resolves when the write operation is complete.
         * @throws {Error} If writing to the file system fails (e.g., permissions or disk space).
         */
        writeValue<T extends IEntity = IEntity>(entityId: EntityId, entity: T): Promise<void>;
        /**
         * Removes an entity from storage by its ID.
         * Deletes the corresponding JSON file, used for cleanup (e.g., removing a `SessionId`’s memory).
         * @param {EntityId} entityId - The identifier of the entity to remove (string or number), unique within its storage context.
         * @returns {Promise<void>} A promise that resolves when the entity is deleted.
         * @throws {Error} If the entity is not found (`ENOENT`) or deletion fails (e.g., permissions).
         */
        removeValue(entityId: EntityId): Promise<void>;
        /**
         * Removes all entities from storage under this entity name.
         * Deletes all `.json` files in the directory, useful for resetting persistence (e.g., clearing a `SwarmName`’s data).
         * @returns {Promise<void>} A promise that resolves when all entities are removed.
         * @throws {Error} If reading the directory or deleting files fails (e.g., permissions).
         */
        removeAll(): Promise<void>;
        /**
         * Iterates over all entities in storage, sorted numerically by ID.
         * Yields entities in ascending order, useful for batch processing (e.g., listing all `SessionId`s in a `SwarmName`).
         * @template T - The specific type of the entities (e.g., `IPersistAliveData`), defaults to `IEntity`.
         * @returns {AsyncGenerator<T>} An async generator yielding each entity in sorted order.
         * @throws {Error} If reading the directory or entity files fails (e.g., permissions or invalid JSON).
         */
        values<T extends IEntity = IEntity>(): AsyncGenerator<T>;
        /**
         * Iterates over all entity IDs in storage, sorted numerically.
         * Yields IDs in ascending order, useful for key enumeration (e.g., listing `SessionId`s in a `SwarmName`).
         * @returns {AsyncGenerator<EntityId>} An async generator yielding each entity ID as a string or number.
         * @throws {Error} If reading the directory fails (e.g., permissions or directory not found).
         */
        keys(): AsyncGenerator<EntityId>;
        /**
         * Filters entities based on a predicate function, yielding only matching entities.
         * Useful for selective retrieval (e.g., finding online `SessionId`s in a `SwarmName`).
         * @template T - The specific type of the entities (e.g., `IPersistAliveData`), defaults to `IEntity`.
         * @param {(value: T) => boolean} predicate - A function to test each entity, returning `true` to include it.
         * @returns {AsyncGenerator<T>} An async generator yielding filtered entities in sorted order.
         * @throws {Error} If reading entities fails during iteration (e.g., invalid JSON).
         */
        filter<T extends IEntity = IEntity>(predicate: (value: T) => boolean): AsyncGenerator<T>;
        /**
         * Takes a limited number of entities, optionally filtered by a predicate.
         * Stops yielding after reaching the specified total, useful for pagination (e.g., sampling `SessionId`s).
         * @template T - The specific type of the entities (e.g., `IPersistStateData`), defaults to `IEntity`.
         * @param {number} total - The maximum number of entities to yield.
         * @param {(value: T) => boolean} [predicate] - Optional function to filter entities before counting.
         * @returns {AsyncGenerator<T>} An async generator yielding up to `total` entities in sorted order.
         * @throws {Error} If reading entities fails during iteration (e.g., permissions).
         */
        take<T extends IEntity = IEntity>(total: number, predicate?: (value: T) => boolean): AsyncGenerator<T>;
        /**
         * Memoized initialization function ensuring it runs only once per instance.
         * Uses `singleshot` to prevent redundant initialization calls, critical for swarm setup efficiency.
         * @private
         * @returns {Promise<void>} A promise that resolves when initialization is complete.
         */
        [BASE_WAIT_FOR_INIT_SYMBOL]: (() => Promise<void>) & functools_kit.ISingleshotClearable;
        /**
         * Implements the async iterator protocol for iterating over entities.
         * Delegates to the `values` method for iteration, enabling `for await` loops over entities.
         * @returns {AsyncIterableIterator<any>} An async iterator yielding entities.
         */
        [Symbol.asyncIterator](): AsyncIterableIterator<any>;
    };
};
/**
 * Type alias for an instance of `PersistBase`, used for type safety in extensions and utilities (e.g., `PersistAliveUtils`).
 * @typedef {InstanceType<typeof PersistBase>} TPersistBase
 */
type TPersistBase = InstanceType<typeof PersistBase>;
/**
 * Extends `PersistBase` to provide a persistent list structure with push/pop operations.
 * Manages entities with numeric keys for ordered access, suitable for queues or logs in the swarm system.
 * @template EntityName - The type of entity name (e.g., `SwarmName`), defaults to `string`, used as a subdirectory.
 * @extends {PersistBase<EntityName>}
 */
declare const PersistList: {
    new <EntityName extends string = string>(entityName: EntityName, baseDir?: string): {
        /** @private Tracks the last used numeric key for the list, initialized to `null` until computed */
        _lastCount: number | null;
        /**
         * Adds an entity to the end of the persistent list with a new unique numeric key.
         * Useful for appending items like messages or events in swarm operations (e.g., within a `SwarmName`).
         * @template T - The specific type of the entity (e.g., `IPersistStateData`), defaults to `IEntity`.
         * @param {T} entity - The entity to append to the list (e.g., a state update).
         * @returns {Promise<void>} A promise that resolves when the entity is written to storage.
         * @throws {Error} If writing to the file system fails (e.g., permissions or disk space).
         */
        push<T extends IEntity = IEntity>(entity: T): Promise<void>;
        /**
         * Removes and returns the last entity from the persistent list.
         * Useful for dequeuing items or retrieving recent entries (e.g., latest event in a `SwarmName` log).
         * @template T - The specific type of the entity (e.g., `IPersistStateData`), defaults to `IEntity`.
         * @returns {Promise<T | null>} A promise resolving to the removed entity or `null` if the list is empty.
         * @throws {Error} If reading or removing the entity fails (e.g., file not found).
         */
        pop<T extends IEntity = IEntity>(): Promise<T | null>;
        /**
         * Queued function to create a new unique key for a list item.
         * Ensures sequential key generation under concurrent calls using `queued` decorator.
         * @private
         * @returns {Promise<string>} A promise resolving to the new key as a string (e.g., "1", "2").
         * @throws {Error} If key generation fails due to underlying storage issues.
         */
        [LIST_CREATE_KEY_SYMBOL]: () => Promise<string>;
        /**
         * Retrieves the key of the last item in the list.
         * Scans all keys to find the highest numeric value, used for pop operations (e.g., dequeuing from a `SwarmName` log).
         * @private
         * @returns {Promise<string | null>} A promise resolving to the last key as a string or `null` if the list is empty.
         * @throws {Error} If key retrieval fails due to underlying storage issues.
         */
        [LIST_GET_LAST_KEY_SYMBOL]: () => Promise<string | null>;
        /**
         * Queued function to remove and return the last item in the list.
         * Ensures atomic pop operations under concurrent calls using `queued` decorator.
         * @private
         * @template T - The specific type of the entity (e.g., `IPersistStateData`), defaults to `IEntity`.
         * @returns {Promise<T | null>} A promise resolving to the removed item or `null` if the list is empty.
         * @throws {Error} If reading or removing the item fails.
         */
        [LIST_POP_SYMBOL]: <T extends IEntity = IEntity>() => Promise<T | null>;
        /** @private The directory path where entity files are stored (e.g., `./logs/data/alive/` for alive status) */
        _directory: string;
        readonly entityName: EntityName;
        readonly baseDir: string;
        /**
         * Computes the full file path for an entity based on its ID.
         * @private
         * @param {EntityId} entityId - The identifier of the entity (string or number), unique within the entity type’s storage.
         * @returns {string} The full file path (e.g., `./logs/data/alive/<entityId>.json`).
         */
        _getFilePath(entityId: EntityId): string;
        /**
         * Initializes the storage directory, creating it if it doesn’t exist, and validates existing entities.
         * Removes invalid JSON files during initialization to ensure data integrity (e.g., for `SwarmName`-based alive status).
         * @param {boolean} initial - Indicates if this is the initial setup; reserved for future caching or optimization logic.
         * @returns {Promise<void>} A promise that resolves when initialization is complete.
         * @throws {Error} If directory creation or entity validation fails (e.g., permissions or I/O errors).
         */
        waitForInit(initial: boolean): Promise<void>;
        /**
         * Retrieves the number of entities stored in the directory.
         * Counts only files with a `.json` extension, useful for monitoring storage usage (e.g., active sessions).
         * @returns {Promise<number>} A promise resolving to the count of stored entities.
         * @throws {Error} If reading the directory fails (e.g., permissions or directory not found).
         */
        getCount(): Promise<number>;
        /**
         * Reads an entity from storage by its ID, parsing it from a JSON file.
         * Core method for retrieving persisted data (e.g., alive status for a `SessionId` in a `SwarmName` context).
         * @template T - The specific type of the entity (e.g., `IPersistAliveData`), defaults to `IEntity`.
         * @param {EntityId} entityId - The identifier of the entity to read (string or number), unique within its storage context.
         * @returns {Promise<T>} A promise resolving to the parsed entity data.
         * @throws {Error} If the file is not found (`ENOENT`) or parsing fails (e.g., invalid JSON).
         */
        readValue<T extends IEntity = IEntity>(entityId: EntityId): Promise<T>;
        /**
         * Checks if an entity exists in storage by its ID.
         * Efficiently verifies presence without reading the full entity (e.g., checking if a `SessionId` has memory).
         * @param {EntityId} entityId - The identifier of the entity to check (string or number), unique within its storage context.
         * @returns {Promise<boolean>} A promise resolving to `true` if the entity exists, `false` otherwise.
         * @throws {Error} If checking existence fails for reasons other than the file not existing.
         */
        hasValue(entityId: EntityId): Promise<boolean>;
        /**
         * Writes an entity to storage with the specified ID, serializing it to JSON.
         * Uses atomic file writing via `writeFileAtomic` to ensure data integrity (e.g., persisting `AgentName` for a `SwarmName`).
         * @template T - The specific type of the entity (e.g., `IPersistActiveAgentData`), defaults to `IEntity`.
         * @param {EntityId} entityId - The identifier for the entity (string or number), unique within its storage context.
         * @param {T} entity - The entity data to persist (e.g., `{ agentName: "agent1" }`).
         * @returns {Promise<void>} A promise that resolves when the write operation is complete.
         * @throws {Error} If writing to the file system fails (e.g., permissions or disk space).
         */
        writeValue<T extends IEntity = IEntity>(entityId: EntityId, entity: T): Promise<void>;
        /**
         * Removes an entity from storage by its ID.
         * Deletes the corresponding JSON file, used for cleanup (e.g., removing a `SessionId`’s memory).
         * @param {EntityId} entityId - The identifier of the entity to remove (string or number), unique within its storage context.
         * @returns {Promise<void>} A promise that resolves when the entity is deleted.
         * @throws {Error} If the entity is not found (`ENOENT`) or deletion fails (e.g., permissions).
         */
        removeValue(entityId: EntityId): Promise<void>;
        /**
         * Removes all entities from storage under this entity name.
         * Deletes all `.json` files in the directory, useful for resetting persistence (e.g., clearing a `SwarmName`’s data).
         * @returns {Promise<void>} A promise that resolves when all entities are removed.
         * @throws {Error} If reading the directory or deleting files fails (e.g., permissions).
         */
        removeAll(): Promise<void>;
        /**
         * Iterates over all entities in storage, sorted numerically by ID.
         * Yields entities in ascending order, useful for batch processing (e.g., listing all `SessionId`s in a `SwarmName`).
         * @template T - The specific type of the entities (e.g., `IPersistAliveData`), defaults to `IEntity`.
         * @returns {AsyncGenerator<T>} An async generator yielding each entity in sorted order.
         * @throws {Error} If reading the directory or entity files fails (e.g., permissions or invalid JSON).
         */
        values<T extends IEntity = IEntity>(): AsyncGenerator<T>;
        /**
         * Iterates over all entity IDs in storage, sorted numerically.
         * Yields IDs in ascending order, useful for key enumeration (e.g., listing `SessionId`s in a `SwarmName`).
         * @returns {AsyncGenerator<EntityId>} An async generator yielding each entity ID as a string or number.
         * @throws {Error} If reading the directory fails (e.g., permissions or directory not found).
         */
        keys(): AsyncGenerator<EntityId>;
        /**
         * Filters entities based on a predicate function, yielding only matching entities.
         * Useful for selective retrieval (e.g., finding online `SessionId`s in a `SwarmName`).
         * @template T - The specific type of the entities (e.g., `IPersistAliveData`), defaults to `IEntity`.
         * @param {(value: T) => boolean} predicate - A function to test each entity, returning `true` to include it.
         * @returns {AsyncGenerator<T>} An async generator yielding filtered entities in sorted order.
         * @throws {Error} If reading entities fails during iteration (e.g., invalid JSON).
         */
        filter<T extends IEntity = IEntity>(predicate: (value: T) => boolean): AsyncGenerator<T>;
        /**
         * Takes a limited number of entities, optionally filtered by a predicate.
         * Stops yielding after reaching the specified total, useful for pagination (e.g., sampling `SessionId`s).
         * @template T - The specific type of the entities (e.g., `IPersistStateData`), defaults to `IEntity`.
         * @param {number} total - The maximum number of entities to yield.
         * @param {(value: T) => boolean} [predicate] - Optional function to filter entities before counting.
         * @returns {AsyncGenerator<T>} An async generator yielding up to `total` entities in sorted order.
         * @throws {Error} If reading entities fails during iteration (e.g., permissions).
         */
        take<T extends IEntity = IEntity>(total: number, predicate?: (value: T) => boolean): AsyncGenerator<T>;
        /**
         * Memoized initialization function ensuring it runs only once per instance.
         * Uses `singleshot` to prevent redundant initialization calls, critical for swarm setup efficiency.
         * @private
         * @returns {Promise<void>} A promise that resolves when initialization is complete.
         */
        [BASE_WAIT_FOR_INIT_SYMBOL]: (() => Promise<void>) & functools_kit.ISingleshotClearable;
        /**
         * Implements the async iterator protocol for iterating over entities.
         * Delegates to the `values` method for iteration, enabling `for await` loops over entities.
         * @returns {AsyncIterableIterator<any>} An async iterator yielding entities.
         */
        [Symbol.asyncIterator](): AsyncIterableIterator<any>;
    };
};
/**
 * Type alias for an instance of `PersistList`, used for type safety in list-based operations (e.g., swarm event logs).
 * @typedef {InstanceType<typeof PersistList>} TPersistList
 */
type TPersistList = InstanceType<typeof PersistList>;
/**
 * Defines the structure for data stored in active agent persistence.
 * Used by `PersistSwarmUtils` to track the currently active agent per client and swarm.
 * @interface IPersistActiveAgentData
 */
interface IPersistActiveAgentData {
    /**
     * The name of the active agent for a given client within a swarm.
     * `AgentName` is a string identifier (e.g., "agent1") representing an agent instance in the swarm system,
     * tied to specific functionality or role within a `SwarmName`.
     * @type {AgentName}
     */
    agentName: AgentName;
}
/**
 * Defines the structure for data stored in navigation stack persistence.
 * Used by `PersistSwarmUtils` to maintain a stack of agent names for navigation history.
 * @interface IPersistNavigationStackData
 */
interface IPersistNavigationStackData {
    /**
     * The stack of agent names representing navigation history for a client within a swarm.
     * `AgentName` is a string identifier (e.g., "agent1", "agent2") for agents in the swarm system,
     * tracking the sequence of active agents for a `SessionId` within a `SwarmName`.
     * @type {AgentName[]}
     */
    agentStack: AgentName[];
}
/**
 * Defines control methods for customizing swarm persistence operations.
 * Allows injection of custom persistence adapters for active agents and navigation stacks tied to `SwarmName`.
 * @interface IPersistSwarmControl
 */
interface IPersistSwarmControl {
    /**
     * Sets a custom persistence adapter for active agent storage.
     * Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory storage for `SwarmName`).
     * @param {TPersistBaseCtor<SwarmName, IPersistActiveAgentData>} Ctor - The constructor for the active agent persistence adapter.
     */
    usePersistActiveAgentAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>): void;
    /**
     * Sets a custom persistence adapter for navigation stack storage.
     * Overrides the default `PersistBase` implementation for specialized behavior (e.g., database storage for `SwarmName`).
     * @param {TPersistBaseCtor<SwarmName, IPersistNavigationStackData>} Ctor - The constructor for the navigation stack persistence adapter.
     */
    usePersistNavigationStackAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>): void;
}
/**
 * Utility class for managing swarm-related persistence, including active agents and navigation stacks.
 * Provides methods to get/set active agents and navigation stacks per client (`SessionId`) and swarm (`SwarmName`), with customizable adapters.
 * @implements {IPersistSwarmControl}
 */
declare class PersistSwarmUtils implements IPersistSwarmControl {
    /** @private Default constructor for active agent persistence, defaults to `PersistBase` */
    private PersistActiveAgentFactory;
    /** @private Default constructor for navigation stack persistence, defaults to `PersistBase` */
    private PersistNavigationStackFactory;
    /**
     * Memoized function to create or retrieve storage for active agents.
     * Ensures a single persistence instance per `SwarmName`, improving efficiency.
     * @private
     * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
     * @returns {IPersistBase<IPersistActiveAgentData>} A persistence instance for active agents, rooted at `./logs/data/swarm/active_agent/`.
     */
    private getActiveAgentStorage;
    /**
     * Configures a custom constructor for active agent persistence, overriding the default `PersistBase`.
     * Allows advanced use cases like in-memory storage for `SwarmName`-specific active agents.
     * @param {TPersistBaseCtor<SwarmName, IPersistActiveAgentData>} Ctor - The constructor to use for active agent storage, implementing `IPersistBase`.
     */
    usePersistActiveAgentAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>): void;
    /**
     * Configures a custom constructor for navigation stack persistence, overriding the default `PersistBase`.
     * Enables customization for navigation tracking within a `SwarmName` (e.g., alternative storage backends).
     * @param {TPersistBaseCtor<SwarmName, IPersistNavigationStackData>} Ctor - The constructor to use for navigation stack storage, implementing `IPersistBase`.
     */
    usePersistNavigationStackAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>): void;
    /**
     * Memoized function to create or retrieve storage for navigation stacks.
     * Ensures a single persistence instance per `SwarmName`, optimizing resource use.
     * @private
     * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
     * @returns {IPersistBase<IPersistNavigationStackData>} A persistence instance for navigation stacks, rooted at `./logs/data/swarm/navigation_stack/`.
     */
    private getNavigationStackStorage;
    /**
     * Retrieves the active agent for a client within a swarm, falling back to a default if not set.
     * Used to determine the current `AgentName` for a `SessionId` in a `SwarmName` context.
     * @param {string} clientId - The identifier of the client, typically a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
     * @param {AgentName} defaultAgent - The default agent name (e.g., "defaultAgent") to return if no active agent is persisted.
     * @returns {Promise<AgentName>} A promise resolving to the active agent’s name, a string identifier (e.g., "agent1").
     * @throws {Error} If reading from storage fails (e.g., file corruption or permissions).
     */
    getActiveAgent: (clientId: string, swarmName: SwarmName, defaultAgent: AgentName) => Promise<AgentName>;
    /**
     * Sets the active agent for a client within a swarm, persisting it for future retrieval.
     * Links a `SessionId` to an `AgentName` within a `SwarmName` for runtime agent switching.
     * @param {string} clientId - The identifier of the client, typically a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @param {AgentName} agentName - The name of the agent to set as active, a string identifier (e.g., "agent1") representing an agent instance.
     * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
     * @returns {Promise<void>} A promise that resolves when the active agent is persisted.
     * @throws {Error} If writing to storage fails (e.g., disk space or permissions).
     */
    setActiveAgent: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void>;
    /**
     * Retrieves the navigation stack for a client within a swarm, returning an empty array if unset.
     * Tracks navigation history as a stack of `AgentName`s for a `SessionId` within a `SwarmName`.
     * @param {string} clientId - The identifier of the client, typically a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
     * @returns {Promise<AgentName[]>} A promise resolving to the navigation stack, an array of agent names (e.g., ["agent1", "agent2"]).
     * @throws {Error} If reading from storage fails (e.g., file corruption).
     */
    getNavigationStack: (clientId: string, swarmName: SwarmName) => Promise<AgentName[]>;
    /**
     * Sets the navigation stack for a client within a swarm, persisting it for future retrieval.
     * Stores a stack of `AgentName`s for a `SessionId` within a `SwarmName` to track navigation history.
     * @param {string} clientId - The identifier of the client, typically a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @param {AgentName[]} agentStack - The navigation stack, an array of agent names (e.g., ["agent1", "agent2"]) to persist.
     * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
     * @returns {Promise<void>} A promise that resolves when the navigation stack is persisted.
     * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
     */
    setNavigationStack: (clientId: string, agentStack: AgentName[], swarmName: SwarmName) => Promise<void>;
}
/**
 * Exported singleton for swarm persistence operations, cast as the control interface.
 * Provides a global point of access for managing active agents and navigation stacks tied to `SwarmName`.
 * @type {IPersistSwarmControl}
 */
declare const PersistSwarm: IPersistSwarmControl;
/**
 * Defines the structure for state data persistence in the swarm system.
 * Wraps arbitrary state data for storage, used by `PersistStateUtils`.
 * @template T - The type of the state data, defaults to `unknown`.
 * @interface IPersistStateData
 */
interface IPersistStateData<T = unknown> {
    /** The state data to persist (e.g., agent configuration or session state) */
    state: T;
}
/**
 * Defines control methods for customizing state persistence operations.
 * Allows injection of a custom persistence adapter for states tied to `StateName`.
 * @interface IPersistStateControl
 */
interface IPersistStateControl {
    /**
     * Sets a custom persistence adapter for state storage.
     * Overrides the default `PersistBase` implementation for specialized behavior (e.g., database storage for `StateName`).
     * @param {TPersistBaseCtor<StateName, IPersistStateData>} Ctor - The constructor for the state persistence adapter.
     */
    usePersistStateAdapter(Ctor: TPersistBaseCtor<StateName, IPersistStateData>): void;
}
/**
 * Utility class for managing state persistence per client (`SessionId`) and state name (`StateName`) in the swarm system.
 * Provides methods to get/set state data with a customizable persistence adapter.
 * @implements {IPersistStateControl}
 */
declare class PersistStateUtils implements IPersistStateControl {
    /** @private Default constructor for state persistence, defaults to `PersistBase` */
    private PersistStateFactory;
    /**
     * Memoized function to create or retrieve storage for a specific state.
     * Ensures a single persistence instance per `StateName`, optimizing resource use.
     * @private
     * @param {StateName} stateName - The name of the state, a string identifier (e.g., "config") categorizing state data.
     * @returns {IPersistBase<IPersistStateData>} A persistence instance for the state, rooted at `./logs/data/state/`.
     */
    private getStateStorage;
    /**
     * Configures a custom constructor for state persistence, overriding the default `PersistBase`.
     * Enables advanced state storage for `StateName` (e.g., in-memory or database-backed persistence).
     * @param {TPersistBaseCtor<StateName, IPersistStateData>} Ctor - The constructor to use for state storage, implementing `IPersistBase`.
     */
    usePersistStateAdapter(Ctor: TPersistBaseCtor<StateName, IPersistStateData>): void;
    /**
     * Sets the state for a client under a specific state name, persisting it for future retrieval.
     * Stores state data for a `SessionId` under a `StateName` (e.g., agent variables).
     * @template T - The specific type of the state data, defaults to `unknown`.
     * @param {T} state - The state data to persist (e.g., configuration object or context).
     * @param {string} clientId - The identifier of the client, typically a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @param {StateName} stateName - The name of the state, a string identifier (e.g., "config") categorizing state data.
     * @returns {Promise<void>} A promise that resolves when the state is persisted.
     * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
     */
    setState: <T = unknown>(state: T, clientId: string, stateName: StateName) => Promise<void>;
    /**
     * Retrieves the state for a client under a specific state name, falling back to a default if unset.
     * Restores state for a `SessionId` under a `StateName` (e.g., resuming agent context).
     * @template T - The specific type of the state data, defaults to `unknown`.
     * @param {string} clientId - The identifier of the client, typically a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @param {StateName} stateName - The name of the state, a string identifier (e.g., "config") categorizing state data.
     * @param {T} defaultState - The default state to return if no state is persisted (e.g., an empty object).
     * @returns {Promise<T>} A promise resolving to the state data.
     * @throws {Error} If reading from storage fails (e.g., file corruption).
     */
    getState: <T = unknown>(clientId: string, stateName: StateName, defaultState: T) => Promise<T>;
}
/**
 * Exported singleton for state persistence operations, cast as the control interface.
 * Provides a global point of access for managing state persistence tied to `StateName` and `SessionId`.
 * @type {IPersistStateControl}
 */
declare const PersistState: IPersistStateControl;
/**
 * Defines the structure for storage data persistence in the swarm system.
 * Wraps an array of storage data for persistence, used by `PersistStorageUtils`.
 * @template T - The type of storage data, defaults to `IStorageData`.
 * @interface IPersistStorageData
 */
interface IPersistStorageData<T extends IStorageData = IStorageData> {
    /** The array of storage data to persist (e.g., key-value pairs or records) */
    data: T[];
}
/**
 * Defines control methods for customizing storage persistence operations.
 * Allows injection of a custom persistence adapter for storage tied to `StorageName`.
 * @interface IPersistStorageControl
 */
interface IPersistStorageControl {
    /**
     * Sets a custom persistence adapter for storage.
     * Overrides the default `PersistBase` implementation for specialized behavior (e.g., database storage for `StorageName`).
     * @param {TPersistBaseCtor<StorageName, IPersistStorageData>} Ctor - The constructor for the storage persistence adapter.
     */
    usePersistStorageAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>): void;
}
/**
 * Utility class for managing storage persistence per client (`SessionId`) and storage name (`StorageName`) in the swarm system.
 * Provides methods to get/set storage data with a customizable persistence adapter.
 * @implements {IPersistStorageControl}
 */
declare class PersistStorageUtils implements IPersistStorageControl {
    /** @private Default constructor for storage persistence, defaults to `PersistBase` */
    private PersistStorageFactory;
    /**
     * Memoized function to create or retrieve storage for a specific storage name.
     * Ensures a single persistence instance per `StorageName`, optimizing resource use.
     * @private
     * @param {StorageName} storageName - The name of the storage, a string identifier (e.g., "user_data") categorizing stored data.
     * @returns {IPersistBase<IPersistStorageData>} A persistence instance for the storage, rooted at `./logs/data/storage/`.
     */
    private getPersistStorage;
    /**
     * Configures a custom constructor for storage persistence, overriding the default `PersistBase`.
     * Enables advanced storage options for `StorageName` (e.g., database-backed persistence).
     * @param {TPersistBaseCtor<StorageName, IPersistStorageData>} Ctor - The constructor to use for storage, implementing `IPersistBase`.
     */
    usePersistStorageAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>): void;
    /**
     * Retrieves the data for a client from a specific storage, falling back to a default if unset.
     * Accesses persistent storage for a `SessionId` under a `StorageName` (e.g., user records).
     * @template T - The specific type of the storage data, defaults to `IStorageData`.
     * @param {string} clientId - The identifier of the client, typically a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @param {StorageName} storageName - The name of the storage, a string identifier (e.g., "user_data") categorizing stored data.
     * @param {T[]} defaultValue - The default value (array) to return if no data is persisted (e.g., an empty array).
     * @returns {Promise<T[]>} A promise resolving to the storage data array.
     * @throws {Error} If reading from storage fails (e.g., file corruption).
     */
    getData: <T extends IStorageData = IStorageData>(clientId: string, storageName: StorageName, defaultValue: T[]) => Promise<T[]>;
    /**
     * Sets the data for a client in a specific storage, persisting it for future retrieval.
     * Stores data for a `SessionId` under a `StorageName` (e.g., user logs).
     * @template T - The specific type of the storage data, defaults to `IStorageData`.
     * @param {T[]} data - The array of data to persist (e.g., key-value pairs or records).
     * @param {string} clientId - The identifier of the client, typically a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @param {StorageName} storageName - The name of the storage, a string identifier (e.g., "user_data") categorizing stored data.
     * @returns {Promise<void>} A promise that resolves when the data is persisted.
     * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
     */
    setData: <T extends IStorageData = IStorageData>(data: T[], clientId: string, storageName: StorageName) => Promise<void>;
}
/**
 * Exported singleton for storage persistence operations, cast as the control interface.
 * Provides a global point of access for managing storage persistence tied to `StorageName` and `SessionId`.
 * @type {IPersistStorageControl}
 */
declare const PersistStorage: IPersistStorageControl;
/**
 * Defines the structure for memory data persistence in the swarm system.
 * Wraps arbitrary memory data for storage, used by `PersistMemoryUtils`.
 * @template T - The type of the memory data, defaults to `unknown`.
 * @interface IPersistMemoryData
 */
interface IPersistMemoryData<T = unknown> {
    /** The memory data to persist (e.g., session context or temporary state) */
    data: T;
}
/**
 * Defines control methods for customizing memory persistence operations.
 * Allows injection of a custom persistence adapter for memory tied to `SessionId`.
 * @interface IPersistMemoryControl
 */
interface IPersistMemoryControl {
    /**
     * Sets a custom persistence adapter for memory storage.
     * Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory storage for `SessionId`).
     * @param {TPersistBaseCtor<SessionId, IPersistMemoryData>} Ctor - The constructor for the memory persistence adapter.
     */
    usePersistMemoryAdapter(Ctor: TPersistBaseCtor<SessionId, IPersistMemoryData>): void;
}
/**
 * Utility class for managing memory persistence per client (`SessionId`) in the swarm system.
 * Provides methods to get/set memory data with a customizable persistence adapter.
 * @implements {IPersistMemoryControl}
 */
declare class PersistMemoryUtils implements IPersistMemoryControl {
    /** @private Default constructor for memory persistence, defaults to `PersistBase` */
    private PersistMemoryFactory;
    /**
     * Memoized function to create or retrieve storage for a specific client’s memory.
     * Ensures a single persistence instance per `SessionId`, optimizing resource use.
     * @private
     * @param {SessionId} clientId - The identifier of the client, a unique string (e.g., "session123") tracking a user session, used as `entityName`.
     * @returns {IPersistBase<IPersistMemoryData>} A persistence instance for the memory, rooted at `./logs/data/memory/`.
     */
    private getMemoryStorage;
    /**
     * Configures a custom constructor for memory persistence, overriding the default `PersistBase`.
     * Enables advanced memory storage for `SessionId` (e.g., in-memory or database-backed persistence).
     * @param {TPersistBaseCtor<SessionId, IPersistMemoryData>} Ctor - The constructor to use for memory storage, implementing `IPersistBase`.
     */
    usePersistMemoryAdapter(Ctor: TPersistBaseCtor<SessionId, IPersistMemoryData>): void;
    /**
     * Sets the memory data for a client, persisting it for future retrieval.
     * Stores session-specific memory for a `SessionId` (e.g., temporary context).
     * @template T - The specific type of the memory data, defaults to `unknown`.
     * @param {T} data - The memory data to persist (e.g., context object or variables).
     * @param {string} clientId - The identifier of the client, a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @returns {Promise<void>} A promise that resolves when the memory is persisted.
     * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
     */
    setMemory: <T = unknown>(data: T, clientId: string) => Promise<void>;
    /**
     * Retrieves the memory data for a client, falling back to a default if unset.
     * Restores session-specific memory for a `SessionId` (e.g., resuming context).
     * @template T - The specific type of the memory data, defaults to `unknown`.
     * @param {string} clientId - The identifier of the client, a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     * @param {T} defaultState - The default memory data to return if none is persisted (e.g., an empty object).
     * @returns {Promise<T>} A promise resolving to the memory data.
     * @throws {Error} If reading from storage fails (e.g., file corruption).
     */
    getMemory: <T = unknown>(clientId: string, defaultState: T) => Promise<T>;
    /**
     * Disposes of the memory storage for a client by clearing its memoized instance.
     * Useful for cleanup when a `SessionId` ends or memory is no longer needed.
     * @param {string} clientId - The identifier of the client, a `SessionId`, a unique string (e.g., "session123") tracking a user session.
     */
    dispose: (clientId: string) => void;
}
/**
 * Exported singleton for memory persistence operations, cast as the control interface.
 * Provides a global point of access for managing memory persistence tied to `SessionId`.
 * @type {IPersistMemoryControl}
 */
declare const PersistMemory: IPersistMemoryControl;
/**
 * Defines the structure for alive status persistence in the swarm system.
 * Tracks whether a client (`SessionId`) is online or offline within a `SwarmName`.
 * @interface IPersistAliveData
 */
interface IPersistAliveData {
    /** Indicates whether the client is online (`true`) or offline (`false`) */
    online: boolean;
}
/**
 * Defines control methods for customizing alive status persistence operations.
 * Allows injection of a custom persistence adapter for alive status tied to `SwarmName`.
 * @interface IPersistAliveControl
 */
interface IPersistAliveControl {
    /**
     * Sets a custom persistence adapter for alive status storage.
     * Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory tracking for `SwarmName`).
     * @param {TPersistBaseCtor<SwarmName, IPersistAliveData>} Ctor - The constructor for the alive status persistence adapter.
     */
    usePersistAliveAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistAliveData>): void;
}
/**
 * Utility class for managing alive status persistence per client (`SessionId`) in the swarm system.
 * Provides methods to mark clients as online/offline and check their status within a `SwarmName`, with a customizable adapter.
 * @implements {IPersistAliveControl}
 */
declare class PersistAliveUtils implements IPersistAliveControl {
    /** @private Default constructor for alive status persistence, defaults to `PersistBase` */
    private PersistAliveFactory;
    /**
     * Memoized function to create or retrieve storage for a specific client’s alive status.
     * Ensures a single persistence instance per client ID, optimizing resource use.
     * @private
     * @param clientId - The identifier of the client (session ID, used as `entityName` in `PersistBase`).
     * @returns A persistence instance for the alive status, rooted at `./logs/data/alive/`.
     */
    private getAliveStorage;
    /**
     * Configures a custom constructor for alive status persistence, overriding the default `PersistBase`.
     * Enables advanced tracking (e.g., in-memory or database-backed persistence).
     * @param Ctor - The constructor to use for alive status storage, implementing `IPersistBase`.
     */
    usePersistAliveAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistAliveData>): void;
    /**
     * Marks a client as online, persisting the status for future retrieval.
     * Used to track client availability in swarm operations.
     * @param clientId - The identifier of the client (session ID).
     * @returns A promise that resolves when the online status is persisted.
     * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
     */
    markOnline: (clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Marks a client as offline, persisting the status for future retrieval.
     * Used to track client availability in swarm operations.
     * @param clientId - The identifier of the client (session ID).
     * @returns A promise that resolves when the offline status is persisted.
     * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
     */
    markOffline: (clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Retrieves the online status for a client, defaulting to `false` if unset.
     * Used to check client availability in swarm workflows.
     * @param clientId - The identifier of the client (session ID).
     * @returns A promise resolving to `true` if the client is online, `false` otherwise.
     * @throws {Error} If reading from storage fails (e.g., file corruption).
     */
    getOnline: (clientId: string, swarmName: SwarmName) => Promise<boolean>;
}
/**
 * Exported singleton for alive status persistence operations, cast as the control interface.
 * Provides a global point of access for managing client online/offline status in the swarm.
 * @type {IPersistAliveControl}
 */
declare const PersistAlive: IPersistAliveControl;
/**
 * Defines the structure for policy data persistence in the swarm system.
 * Tracks banned clients (`SessionId`) within a `SwarmName` under a specific policy.
 * @interface IPersistPolicyData
 */
interface IPersistPolicyData {
    /** Array of session IDs that are banned under this policy */
    bannedClients: SessionId[];
}
/**
 * Defines control methods for customizing policy persistence operations.
 * Allows injection of a custom persistence adapter for policy data tied to `SwarmName`.
 * @interface IPersistPolicyControl
 */
interface IPersistPolicyControl {
    /**
     * Sets a custom persistence adapter for policy data storage.
     * Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory tracking for `SwarmName`).
     * @param {TPersistBaseCtor<SwarmName, IPersistPolicyData>} Ctor - The constructor for the policy data persistence adapter.
     */
    usePersistPolicyAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistPolicyData>): void;
}
/**
 * Utility class for managing policy data persistence in the swarm system.
 * Provides methods to get and set banned clients within a `SwarmName`, with a customizable adapter.
 * @implements {IPersistPolicyControl}
 */
declare class PersistPolicyUtils implements IPersistPolicyControl {
    /** @private Default constructor for policy data persistence, defaults to `PersistBase` */
    private PersistPolicyFactory;
    /**
     * Memoized function to create or retrieve storage for a specific policy data.
     * Ensures a single persistence instance per swarm, optimizing resource use.
     * @private
     * @param swarmName - The identifier of the swarm.
     * @returns A persistence instance for the policy data, rooted at `./logs/data/policy/`.
     */
    private getPolicyStorage;
    /**
     * Configures a custom constructor for policy data persistence, overriding the default `PersistBase`.
     * Enables advanced tracking (e.g., in-memory or database-backed persistence).
     * @param Ctor - The constructor to use for policy data storage, implementing `IPersistBase`.
     */
    usePersistPolicyAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistPolicyData>): void;
    /**
     * Retrieves the list of banned clients for a specific policy, defaulting to an empty array if unset.
     * Used to check client ban status in swarm workflows.
     * @param policyName - The identifier of the policy to check.
     * @param swarmName - The identifier of the swarm.
     * @param defaultValue - Optional default value if no banned clients are found.
     * @returns A promise resolving to an array of banned client session IDs.
     * @throws {Error} If reading from storage fails (e.g., file corruption).
     */
    getBannedClients: (policyName: PolicyName, swarmName: SwarmName, defaultValue?: SessionId[]) => Promise<SessionId[]>;
    /**
     * Sets the list of banned clients for a specific policy, persisting the status for future retrieval.
     * Used to manage client bans in swarm operations.
     * @param bannedClients - Array of session IDs to be banned under this policy.
     * @param policyName - The identifier of the policy to update.
     * @param swarmName - The identifier of the swarm.
     * @returns A promise that resolves when the banned clients list is persisted.
     * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
     */
    setBannedClients: (bannedClients: SessionId[], policyName: PolicyName, swarmName: SwarmName) => Promise<void>;
}
/**
 * Exported singleton for policy persistence operations, cast as the control interface.
 * Provides a global point of access for managing client bans in the swarm.
 * @type {IPersistPolicyControl}
 */
declare const PersistPolicy: IPersistPolicyControl;

/**
 * Callbacks for managing history instance lifecycle and message handling.
 */
interface IHistoryInstanceCallbacks {
    /**
     * Retrieves dynamic system prompt messages for an agent.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     * @returns An array of system prompt message contents.
     */
    getSystemPrompt?: (clientId: string, agentName: AgentName) => Promise<string[]> | string[];
    /**
     * Determines whether a message should be included in the history iteration.
     * @param message - The message to evaluate.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     * @returns Whether the message passes the filter.
     */
    filterCondition?: (message: IModelMessage, clientId: string, agentName: AgentName) => Promise<boolean> | boolean;
    /**
     * Fetches initial history data for an agent.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     * @returns The initial array of history messages.
     */
    getData: (clientId: string, agentName: AgentName) => Promise<IModelMessage[]> | IModelMessage[];
    /**
     * Called when the history array changes (e.g., after push or pop).
     * @param data - The updated array of history messages.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     */
    onChange: (data: IModelMessage[], clientId: string, agentName: AgentName) => void;
    /**
     * Called when a new message is pushed to the history.
     * @param data - The newly pushed message.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     */
    onPush: (data: IModelMessage, clientId: string, agentName: AgentName) => void;
    /**
     * Called when the last message is popped from the history.
     * @param data - The popped message, or null if the history is empty.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     */
    onPop: (data: IModelMessage | null, clientId: string, agentName: AgentName) => void;
    /**
     * Called for each message during iteration when reading.
     * @param message - The current message being read.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     */
    onRead: (message: IModelMessage, clientId: string, agentName: AgentName) => void;
    /**
     * Called at the start of a history read operation.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     */
    onReadBegin: (clientId: string, agentName: AgentName) => void;
    /**
     * Called at the end of a history read operation.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     */
    onReadEnd: (clientId: string, agentName: AgentName) => void;
    /**
     * Called when the history instance is disposed.
     * @param clientId - The client ID.
     */
    onDispose: (clientId: string) => void;
    /**
     * Called when the history instance is initialized.
     * @param clientId - The client ID.
     */
    onInit: (clientId: string) => void;
    /**
     * Provides a reference to the history instance after creation.
     * @param history - The history instance.
     */
    onRef: (history: IHistoryInstance) => void;
}
/**
 * Interface defining methods for interacting with a history adapter.
 */
interface IHistoryAdapter {
    /**
     * Iterates over history messages for a client and agent.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     * @returns An async iterator yielding history messages.
     */
    iterate(clientId: string, agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Adds a new message to the history.
     * @param value - The message to add.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     * @returns A promise that resolves when the message is added.
     */
    push: (value: IModelMessage, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Removes and returns the last message from the history.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent.
     * @returns The last message, or null if the history is empty.
     */
    pop: (clientId: string, agentName: AgentName) => Promise<IModelMessage | null>;
    /**
     * Disposes of the history for a client and agent, optionally clearing all data.
     * @param clientId - The client ID.
     * @param agentName - The name of the agent, or null to dispose fully.
     * @returns A promise that resolves when disposal is complete.
     */
    dispose: (clientId: string, agentName: AgentName | null) => Promise<void>;
}
/**
 * Interface defining control methods for configuring history behavior.
 */
interface IHistoryControl {
    /**
     * Sets a custom history instance constructor for the adapter.
     * @param Ctor - The constructor for creating history instances.
     */
    useHistoryAdapter(Ctor: THistoryInstanceCtor): void;
    /**
     * Configures lifecycle callbacks for history instances.
     * @param Callbacks - The callbacks to apply.
     */
    useHistoryCallbacks: (Callbacks: Partial<IHistoryInstanceCallbacks>) => void;
}
/**
 * Interface defining methods for a history instance implementation.
 */
interface IHistoryInstance {
    /**
     * Iterates over history messages for an agent.
     * @param agentName - The name of the agent.
     * @returns An async iterator yielding history messages.
     */
    iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Initializes the history for an agent, loading initial data if needed.
     * @param agentName - The name of the agent.
     * @param init - Whether this is the initial setup (affects caching behavior).
     * @returns A promise that resolves when initialization is complete.
     */
    waitForInit(agentName: AgentName, init: boolean): Promise<void>;
    /**
     * Adds a new message to the history for an agent.
     * @param value - The message to add.
     * @param agentName - The name of the agent.
     * @returns A promise that resolves when the message is added.
     */
    push(value: IModelMessage, agentName: AgentName): Promise<void>;
    /**
     * Removes and returns the last message from the history for an agent.
     * @param agentName - The name of the agent.
     * @returns The last message, or null if the history is empty.
     */
    pop(agentName: AgentName): Promise<IModelMessage | null>;
    /**
     * Disposes of the history for an agent, optionally clearing all data.
     * @param agentName - The name of the agent, or null to dispose fully.
     * @returns A promise that resolves when disposal is complete.
     */
    dispose(agentName: AgentName | null): Promise<void>;
}
/**
 * Constructor type for creating history instances.
 */
type THistoryInstanceCtor = new (clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>) => IHistoryInstance;
/** @private Symbol for memoizing the waitForInit method in HistoryMemoryInstance */
declare const HISTORY_MEMORY_INSTANCE_WAIT_FOR_INIT: unique symbol;
/** @private Symbol for memoizing the waitForInit method in HistoryPersistInstance */
declare const HISTORY_PERSIST_INSTANCE_WAIT_FOR_INIT: unique symbol;
/**
 * Manages a persistent history of messages, storing them in memory and on disk.
 * @implements {IHistoryInstance}
 */
declare const HistoryPersistInstance: {
    new (clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>): {
        /** @private The in-memory array of history messages */
        _array: IModelMessage[];
        /** @private The persistent storage instance for history messages */
        _persistStorage: TPersistList;
        /**
         * Initializes the history for an agent, loading data from persistent storage if needed.
         * @param agentName - The name of the agent.
         * @returns A promise that resolves when initialization is complete.
         */
        waitForInit(agentName: AgentName): Promise<void>;
        readonly clientId: string;
        readonly callbacks: Partial<IHistoryInstanceCallbacks>;
        /**
         * Iterates over history messages, applying filters and system prompts if configured.
         * Invokes onRead callbacks during iteration if provided.
         * @param agentName - The name of the agent.
         * @returns An async iterator yielding filtered messages.
         */
        iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
        /**
         * Adds a new message to the history, persisting it to storage.
         * Invokes onPush and onChange callbacks if provided.
         * @param value - The message to add.
         * @param agentName - The name of the agent.
         * @returns A promise that resolves when the message is persisted.
         */
        push(value: IModelMessage, agentName: AgentName): Promise<void>;
        /**
         * Removes and returns the last message from the history, updating persistent storage.
         * Invokes onPop and onChange callbacks if provided.
         * @param agentName - The name of the agent.
         * @returns The last message, or null if the history is empty.
         */
        pop(agentName: AgentName): Promise<IModelMessage | null>;
        /**
         * Disposes of the history, clearing all data if agentName is null.
         * Invokes onDispose callback if provided.
         * @param agentName - The name of the agent, or null to clear all data.
         * @returns A promise that resolves when disposal is complete.
         */
        dispose(agentName: AgentName | null): Promise<void>;
        /**
         * Memoized initialization function to ensure it runs only once per agent.
         * @private
         * @param agentName - The name of the agent.
         * @returns A promise that resolves when initialization is complete.
         */
        [HISTORY_PERSIST_INSTANCE_WAIT_FOR_INIT]: ((agentName: AgentName) => Promise<void>) & functools_kit.ISingleshotClearable;
    };
};
/**
 * Type alias for an instance of HistoryPersistInstance.
 */
type THistoryPersistInstance = InstanceType<typeof HistoryPersistInstance>;
/**
 * Manages an in-memory history of messages without persistence.
 * @implements {IHistoryInstance}
 */
declare const HistoryMemoryInstance: {
    new (clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>): {
        /** @private The in-memory array of history messages */
        _array: IModelMessage[];
        /**
         * Initializes the history for an agent, loading initial data if needed.
         * @param agentName - The name of the agent.
         * @returns A promise that resolves when initialization is complete.
         */
        waitForInit(agentName: AgentName): Promise<void>;
        readonly clientId: string;
        readonly callbacks: Partial<IHistoryInstanceCallbacks>;
        /**
         * Iterates over history messages, applying filters and system prompts if configured.
         * Invokes onRead callbacks during iteration if provided.
         * @param agentName - The name of the agent.
         * @returns An async iterator yielding filtered messages.
         */
        iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
        /**
         * Adds a new message to the in-memory history.
         * Invokes onPush and onChange callbacks if provided.
         * @param value - The message to add.
         * @param agentName - The name of the agent.
         * @returns A promise that resolves when the message is added.
         */
        push(value: IModelMessage, agentName: AgentName): Promise<void>;
        /**
         * Removes and returns the last message from the in-memory history.
         * Invokes onPop and onChange callbacks if provided.
         * @param agentName - The name of the agent.
         * @returns The last message, or null if the history is empty.
         */
        pop(agentName: AgentName): Promise<IModelMessage | null>;
        /**
         * Disposes of the history, clearing all data if agentName is null.
         * Invokes onDispose callback if provided.
         * @param agentName - The name of the agent, or null to clear all data.
         * @returns A promise that resolves when disposal is complete.
         */
        dispose(agentName: AgentName | null): Promise<void>;
        /**
         * Memoized initialization function to ensure it runs only once per agent.
         * @private
         * @param agentName - The name of the agent.
         * @returns A promise that resolves when initialization is complete.
         */
        [HISTORY_MEMORY_INSTANCE_WAIT_FOR_INIT]: ((agentName: AgentName) => Promise<void>) & functools_kit.ISingleshotClearable;
    };
};
/**
 * Type alias for an instance of HistoryMemoryInstance.
 */
type THistoryMemoryInstance = InstanceType<typeof HistoryMemoryInstance>;
/**
 * Exported History Control interface for configuring history behavior.
 * @type {IHistoryControl}
 */
declare const History: IHistoryControl;

/**
 * Interface representing the history of model messages within the swarm.
 * Provides methods to manage and retrieve a sequence of messages for an agent or raw usage.
 */
interface IHistory {
    /**
     * Adds a message to the end of the history.
     * Updates the history store asynchronously.
     * @param {IModelMessage} message - The model message to append to the history.
     * @returns {Promise<void>} A promise that resolves when the message is successfully added.
     * @throws {Error} If the push operation fails (e.g., due to storage issues or invalid message).
     */
    push(message: IModelMessage): Promise<void>;
    /**
     * Removes and returns the last message from the history.
     * @returns {Promise<IModelMessage | null>} A promise resolving to the last message if available, or null if the history is empty.
     * @throws {Error} If the pop operation fails (e.g., due to internal errors).
     */
    pop(): Promise<IModelMessage | null>;
    /**
     * Converts the history into an array of messages tailored for a specific agent.
     * Filters or formats messages based on the provided prompt and optional system prompts.
     * @param {string} prompt - The prompt used to contextualize or filter messages for the agent.
     * @param {string[]} [system] - Optional array of system prompts to include or influence message formatting.
     * @returns {Promise<IModelMessage[]>} A promise resolving to an array of model messages formatted for the agent.
     * @throws {Error} If conversion fails (e.g., due to adapter issues or invalid prompt).
     */
    toArrayForAgent(prompt: string, system?: string[]): Promise<IModelMessage[]>;
    /**
     * Converts the entire history into an array of raw model messages.
     * Retrieves all messages without agent-specific filtering or formatting.
     * @returns {Promise<IModelMessage[]>} A promise resolving to an array of raw model messages.
     * @throws {Error} If conversion fails (e.g., due to adapter issues).
     */
    toArrayForRaw(): Promise<IModelMessage[]>;
}
/**
 * Interface representing the parameters required to create a history instance.
 * Extends the history schema with runtime dependencies for agent-specific history management.
 * @extends {IHistorySchema}
 */
interface IHistoryParams extends IHistorySchema {
    /** The unique name of the agent associated with this history instance. */
    agentName: AgentName;
    /** The unique ID of the client associated with this history instance. */
    clientId: string;
    /** The logger instance for recording history-related activity and errors. */
    logger: ILogger;
    /** The bus instance for event communication within the swarm. */
    bus: IBus;
}
/**
 * Interface representing the schema for history configuration.
 * Defines the underlying storage mechanism for model messages.
 */
interface IHistorySchema {
    /**
     * The adapter responsible for managing the array of model messages.
     * Provides the implementation for history storage and retrieval.
     */
    items: IHistoryAdapter;
}

/**
 * Interface representing a completion mechanism.
 * Extends the completion schema to provide a complete API for generating model responses.
 * @extends {ICompletionSchema}
 */
interface ICompletion extends ICompletionSchema {
}
/**
 * Interface representing the arguments required to request a completion.
 * Encapsulates context and inputs for generating a model response.
 */
interface ICompletionArgs {
    /** The unique ID of the client requesting the completion. */
    clientId: string;
    /** The unique name of the agent associated with the completion request. */
    agentName: AgentName;
    /** The source of the last message, indicating whether it originated from a tool or user. */
    mode: ExecutionMode;
    /** An array of model messages providing the conversation history or context for the completion. */
    messages: IModelMessage[];
    /** Optional array of tools available for the completion process (e.g., for tool calls). */
    tools?: ITool[];
}
/**
 * Interface representing lifecycle callbacks for completion events.
 * Provides hooks for post-completion actions.
 */
interface ICompletionCallbacks {
    /**
     * Optional callback triggered after a completion is successfully generated.
     * Useful for logging, output processing, or triggering side effects.
     * @param {ICompletionArgs} args - The arguments used to generate the completion.
     * @param {IModelMessage} output - The model-generated message resulting from the completion.
     */
    onComplete?: (args: ICompletionArgs, output: IModelMessage) => void;
}
/**
 * Interface representing the schema for configuring a completion mechanism.
 * Defines how completions are generated within the swarm.
 */
interface ICompletionSchema {
    /** The unique name of the completion mechanism within the swarm. */
    completionName: CompletionName;
    /**
     * Retrieves a completion based on the provided arguments.
     * Generates a model response using the given context and tools.
     * @param {ICompletionArgs} args - The arguments required to generate the completion, including client, agent, and message context.
     * @returns {Promise<IModelMessage>} A promise resolving to the generated model message.
     * @throws {Error} If completion generation fails (e.g., due to invalid arguments, model errors, or tool issues).
     */
    getCompletion(args: ICompletionArgs): Promise<IModelMessage>;
    /** Optional partial set of callbacks for completion events, allowing customization of post-completion behavior. */
    callbacks?: Partial<ICompletionCallbacks>;
}
/**
 * Type representing the unique name of a completion mechanism within the swarm.
 * @typedef {string} CompletionName
 */
type CompletionName = string;

/**
 * Type representing possible values for tool parameters.
 * @typedef {string | number | boolean | null} ToolValue
 */
type ToolValue = string | number | boolean | null;
/**
 * Interface representing lifecycle callbacks for an agent tool.
 * Provides hooks for pre- and post-execution, validation, and error handling.
 * @template T - The type of the parameters for the tool, defaults to a record of ToolValue.
 */
interface IAgentToolCallbacks<T = Record<string, ToolValue>> {
    /**
     * Optional callback triggered before the tool is executed.
     * Useful for logging, pre-processing, or setup tasks.
     * @param {string} toolId - The unique `tool_call_id` for tracking in OpenAI-style history.
     * @param {string} clientId - The ID of the client invoking the tool.
     * @param {AgentName} agentName - The name of the agent using the tool.
     * @param {T} params - The parameters passed to the tool.
     * @returns {Promise<void>} A promise that resolves when pre-call actions are complete.
     */
    onBeforeCall?: (toolId: string, clientId: string, agentName: AgentName, params: T) => Promise<void>;
    /**
     * Optional callback triggered after the tool is executed.
     * Useful for cleanup, logging, or post-processing.
     * @param {string} toolId - The unique `tool_call_id` for tracking in OpenAI-style history.
     * @param {string} clientId - The ID of the client invoking the tool.
     * @param {AgentName} agentName - The name of the agent using the tool.
     * @param {T} params - The parameters passed to the tool.
     * @returns {Promise<void>} A promise that resolves when post-call actions are complete.
     */
    onAfterCall?: (toolId: string, clientId: string, agentName: AgentName, params: T) => Promise<void>;
    /**
     * Optional callback triggered to validate tool parameters before execution.
     * Allows custom validation logic specific to the tool.
     * @param {string} clientId - The ID of the client invoking the tool.
     * @param {AgentName} agentName - The name of the agent using the tool.
     * @param {T} params - The parameters to validate.
     * @returns {Promise<boolean>} A promise resolving to true if parameters are valid, false otherwise.
     */
    onValidate?: (clientId: string, agentName: AgentName, params: T) => Promise<boolean>;
    /**
     * Optional callback triggered when the tool execution fails.
     * Useful for error logging or recovery actions.
     * @param {string} toolId - The unique `tool_call_id` for tracking in OpenAI-style history.
     * @param {string} clientId - The ID of the client invoking the tool.
     * @param {AgentName} agentName - The name of the agent using the tool.
     * @param {T} params - The parameters passed to the tool.
     * @param {Error} error - The error that caused the failure.
     * @returns {Promise<void>} A promise that resolves when error handling is complete.
     */
    onCallError?: (toolId: string, clientId: string, agentName: AgentName, params: T, error: Error) => Promise<void>;
}
/**
 * Interface representing a tool used by an agent, extending the base ITool interface.
 * Defines the tool's execution and validation logic, with optional lifecycle callbacks.
 * @template T - The type of the parameters for the tool, defaults to a record of ToolValue.
 * @extends {ITool}
 */
interface IAgentTool<T = Record<string, ToolValue>> extends ITool {
    /** Optional description for documentation purposes, aiding in tool usage understanding. */
    docNote?: string;
    /** The unique name of the tool, used for identification within the agent swarm. */
    toolName: ToolName;
    /**
     * Executes the tool with the specified parameters and context.
     * @param {Object} dto - The data transfer object containing execution details.
     * @param {string} dto.toolId - The unique `tool_call_id` for tracking in OpenAI-style history.
     * @param {string} dto.clientId - The ID of the client invoking the tool.
     * @param {AgentName} dto.agentName - The name of the agent using the tool.
     * @param {T} dto.params - The parameters for the tool execution.
     * @param {IToolCall[]} dto.toolCalls - The list of tool calls in the current execution context.
     * @param {boolean} dto.isLast - Indicates if this is the last tool call in a sequence.
     * @returns {Promise<void>} A promise that resolves when the tool execution is complete.
     * @throws {Error} If the tool execution fails or parameters are invalid.
     */
    call(dto: {
        toolId: string;
        clientId: string;
        agentName: AgentName;
        params: T;
        toolCalls: IToolCall[];
        isLast: boolean;
    }): Promise<void>;
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
    validate(dto: {
        clientId: string;
        agentName: AgentName;
        toolCalls: IToolCall[];
        params: T;
    }): Promise<boolean> | boolean;
    /** Optional lifecycle callbacks for the tool, allowing customization of execution flow. */
    callbacks?: Partial<IAgentToolCallbacks>;
}
/**
 * Interface representing the runtime parameters for an agent.
 * Combines schema properties (excluding certain fields) with callbacks and runtime dependencies.
 * @extends {Omit<IAgentSchema, "tools" | "completion" | "validate">}
 * @extends {IAgentSchemaCallbacks}
 */
interface IAgentParams extends Omit<IAgentSchema, keyof {
    tools: never;
    completion: never;
    validate: never;
}>, IAgentSchemaCallbacks {
    /** The ID of the client interacting with the agent. */
    clientId: string;
    /** The logger instance for recording agent activity and errors. */
    logger: ILogger;
    /** The bus instance for event communication within the swarm. */
    bus: IBus;
    /** The history instance for tracking agent interactions. */
    history: IHistory;
    /** The completion instance for generating responses or outputs. */
    completion: ICompletion;
    /** Optional array of tools available to the agent for execution. */
    tools?: IAgentTool[];
    /**
     * Validates the agent's output before finalization.
     * @param {string} output - The output string to validate.
     * @returns {Promise<string | null>} A promise resolving to the validated output or null if invalid.
     */
    validate: (output: string) => Promise<string | null>;
}
/**
 * Interface representing lifecycle callbacks for an agent.
 * Provides hooks for various stages of agent execution and interaction.
 */
interface IAgentSchemaCallbacks {
    /**
     * Optional callback triggered when the agent runs statelessly (without history updates).
     * @param {string} clientId - The ID of the client invoking the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @param {string} input - The input provided to the agent.
     */
    onRun?: (clientId: string, agentName: AgentName, input: string) => void;
    /**
     * Optional callback triggered when the agent begins execution.
     * @param {string} clientId - The ID of the client invoking the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @param {string} input - The input provided to the agent.
     * @param {ExecutionMode} mode - The execution source (e.g., "tool" or "user").
     */
    onExecute?: (clientId: string, agentName: AgentName, input: string, mode: ExecutionMode) => void;
    /**
     * Optional callback triggered when a tool produces output.
     * @param {string} toolId - The unique `tool_call_id` for tracking in OpenAI-style history.
     * @param {string} clientId - The ID of the client invoking the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @param {string} content - The output content from the tool.
     */
    onToolOutput?: (toolId: string, clientId: string, agentName: AgentName, content: string) => void;
    /**
     * Optional callback triggered when a system message is generated.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @param {string} message - The system message content.
     */
    onSystemMessage?: (clientId: string, agentName: AgentName, message: string) => void;
    /**
     * Optional callback triggered when an assistant message is committed.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @param {string} message - The assistant message content.
     */
    onAssistantMessage?: (clientId: string, agentName: AgentName, message: string) => void;
    /**
     * Optional callback triggered when a user message is received.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @param {string} message - The user message content.
     */
    onUserMessage?: (clientId: string, agentName: AgentName, message: string) => void;
    /**
     * Optional callback triggered when the agent's history is flushed.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     */
    onFlush?: (clientId: string, agentName: AgentName) => void;
    /**
     * Optional callback triggered when the agent produces output.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     * W
     * @param {string} output - The output string generated by the agent.
     */
    onOutput?: (clientId: string, agentName: AgentName, output: string) => void;
    /**
     * Optional callback triggered when the agent is resurrected after a pause or failure.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @param {ExecutionMode} mode - The execution source (e.g., "tool" or "user").
     * @param {string} [reason] - Optional reason for the resurrection.
     */
    onResurrect?: (clientId: string, agentName: AgentName, mode: ExecutionMode, reason?: string) => void;
    /**
     * Optional callback triggered when the agent is initialized.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     */
    onInit?: (clientId: string, agentName: AgentName) => void;
    /**
     * Optional callback triggered when the agent is disposed of.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     */
    onDispose?: (clientId: string, agentName: AgentName) => void;
    /**
     * Optional callback triggered after all tool calls in a sequence are completed.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @param {IToolCall[]} toolCalls - The array of tool calls executed.
     */
    onAfterToolCalls?: (clientId: string, agentName: AgentName, toolCalls: IToolCall[]) => void;
}
/**
 * Interface representing the configuration schema for an agent.
 * Defines the agent's properties, tools, and lifecycle behavior.
 */
interface IAgentSchema {
    /**
     * Optional function to filter or modify tool calls before execution.
     * @param {IToolCall[]} tool - The array of tool calls to process.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {IToolCall[] | Promise<IToolCall[]>} The filtered or modified tool calls.
     */
    mapToolCalls?: (tool: IToolCall[], clientId: string, agentName: AgentName) => IToolCall[] | Promise<IToolCall[]>;
    /** Optional maximum number of tool calls allowed per completion cycle. */
    maxToolCalls?: number;
    /** Optional description for documentation purposes, aiding in agent usage understanding. */
    docDescription?: string;
    /** The unique name of the agent within the swarm. */
    agentName: AgentName;
    /** The name of the completion mechanism used by the agent. */
    completion: CompletionName;
    /** The primary prompt guiding the agent's behavior. */
    prompt: string;
    /** Optional array of system prompts, typically used for tool-calling protocols. */
    system?: string[];
    /** Optional array of tool names available to the agent. */
    tools?: ToolName[];
    /** Optional array of storage names utilized by the agent. */
    storages?: StorageName[];
    /** Optional array of state names managed by the agent. */
    states?: StateName[];
    /** Optional array of agent names this agent depends on for transitions (e.g., via changeToAgent). */
    dependsOn?: AgentName[];
    /**
     * Optional function to validate the agent's output before finalization.
     * @param {string} output - The output string to validate.
     * @returns {Promise<string | null>} A promise resolving to the validated output or null if invalid.
     */
    validate?: (output: string) => Promise<string | null>;
    /**
     * Optional function to transform the model's output before further processing.
     * @param {string} input - The raw input from the model.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<string> | string} The transformed output string.
     */
    transform?: (input: string, clientId: string, agentName: AgentName) => Promise<string> | string;
    /**
     * Optional function to map assistant messages, e.g., converting JSON to tool calls for specific models.
     * @param {IModelMessage} message - The assistant message to process.
     * @param {string} clientId - The ID of the client interacting with the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<IModelMessage> | IModelMessage} The transformed assistant message.
     */
    map?: (message: IModelMessage, clientId: string, agentName: AgentName) => Promise<IModelMessage> | IModelMessage;
    /** Optional lifecycle callbacks for the agent, allowing customization of execution flow. */
    callbacks?: Partial<IAgentSchemaCallbacks>;
}
/**
 * Interface representing an agent's runtime behavior and interaction methods.
 * Defines how the agent processes inputs, commits messages, and manages its lifecycle.
 */
interface IAgent {
    /**
     * Runs the agent statelessly without modifying chat history.
     * Useful for one-off computations or previews.
     * @param {string} input - The input string to process.
     * @returns {Promise<string>} A promise resolving to the agent's output.
     * @throws {Error} If execution fails due to invalid input or internal errors.
     */
    run: (input: string) => Promise<string>;
    /**
     * Executes the agent with the given input, potentially updating history based on mode.
     * @param {string} input - The input string to process.
     * @param {ExecutionMode} mode - The execution source (e.g., "tool" or "user").
     * @returns {Promise<void>} A promise that resolves when execution is complete.
     * @throws {Error} If execution fails due to invalid input, tools, or internal errors.
     */
    execute: (input: string, mode: ExecutionMode) => Promise<void>;
    /**
     * Waits for and retrieves the agent's output after execution.
     * @returns {Promise<string>} A promise resolving to the output string.
     * @throws {Error} If no output is available or waiting times out.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Commits tool output to the agent's history or state.
     * @param {string} toolId - The unique `tool_call_id` for tracking in OpenAI-style history.
     * @param {string} content - The output content from the tool.
     * @returns {Promise<void>} A promise that resolves when the output is committed.
     * @throws {Error} If the tool ID is invalid or committing fails.
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Commits a system message to the agent's history or state.
     * @param {string} message - The system message content to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     * @throws {Error} If committing the message fails.
     */
    commitSystemMessage(message: string): Promise<void>;
    /**
     * Commits a user message to the agent's history without triggering a response.
     * @param {string} message - The user message content to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     * @throws {Error} If committing the message fails.
     */
    commitUserMessage(message: string, mode: ExecutionMode): Promise<void>;
    /**
     * Commits an assistant message to the agent's history without triggering a response.
     * @param {string} message - The assistant message content to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     * @throws {Error} If committing the message fails.
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Clears the agent's history, resetting it to an initial state.
     * @returns {Promise<void>} A promise that resolves when the history is flushed.
     * @throws {Error} If flushing the history fails.
     */
    commitFlush(): Promise<void>;
    /**
     * Prevents the next tool in the execution sequence from running and stops further tool calls.
     * @returns {Promise<void>} A promise that resolves when the stop is committed.
     * @throws {Error} If stopping the tools fails.
     */
    commitStopTools(): Promise<void>;
    /**
     * Unlocks the execution queue and signals an agent change, stopping subsequent tool executions.
     * @returns {Promise<void>} A promise that resolves when the agent change is committed.
     * @throws {Error} If committing the agent change fails.
     */
    commitAgentChange(): Promise<void>;
}
/**
 * Type representing the unique name of an agent within the swarm.
 * @typedef {string} AgentName
 */
type AgentName = string;
/**
 * Type representing the unique name of a tool within the swarm.
 * @typedef {string} ToolName
 */
type ToolName = string;

/**
 * Interface defining the structure of method call context in the swarm system.
 * Represents metadata for tracking a specific method invocation, used across services like ClientAgent, PerfService, and LoggerService.
 * @interface IMethodContext
 */
interface IMethodContext {
    /**
     * The unique identifier of the client session, tying to ClientAgent’s clientId and PerfService’s execution tracking.
     * @type {string}
     */
    clientId: string;
    /**
     * The name of the method being invoked, used in LoggerService (e.g., log method context) and PerfService (e.g., METHOD_NAME_COMPUTE_STATE).
     * @type {string}
     */
    methodName: string;
    /**
     * The name of the agent involved in the method call, sourced from Agent.interface, used in ClientAgent (e.g., agent-specific execution) and DocService (e.g., agent docs).
     * @type {AgentName}
     */
    agentName: AgentName;
    /**
     * The name of the swarm involved in the method call, sourced from Swarm.interface, used in PerfService (e.g., computeClientState) and DocService (e.g., swarm docs).
     * @type {SwarmName}
     */
    swarmName: SwarmName;
    /**
     * The name of the storage resource involved, sourced from Storage.interface, used in ClientAgent (e.g., storage access) and DocService (e.g., storage docs).
     * @type {StorageName}
     */
    storageName: StorageName;
    /**
     * The name of the state resource involved, sourced from State.interface, used in PerfService (e.g., sessionState) and DocService (e.g., state docs).
     * @type {StateName}
     */
    stateName: StateName;
    /**
     * The name of the policy involved, sourced from Policy.interface, used in PerfService (e.g., policyBans) and DocService (e.g., policy docs).
     * @type {PolicyName}
     */
    policyName: PolicyName;
}
/**
 * Scoped service class providing method call context information in the swarm system.
 * Stores and exposes an IMethodContext object (clientId, methodName, agentName, etc.) via dependency injection, scoped using di-scoped for method-specific instances.
 * Integrates with ClientAgent (e.g., EXECUTE_FN method context), PerfService (e.g., computeClientState with METHOD_NAME_COMPUTE_STATE), LoggerService (e.g., context logging in info), and DocService (e.g., documenting method-related entities).
 * Provides a lightweight, immutable context container for tracking method invocation metadata across the system.
 */
declare const MethodContextService: (new () => {
    readonly context: IMethodContext;
}) & Omit<{
    new (context: IMethodContext): {
        readonly context: IMethodContext;
    };
}, "prototype"> & di_scoped.IScopedClassRun<[context: IMethodContext]>;

/**
 * Service class implementing the ILogger interface to provide logging functionality in the swarm system.
 * Handles log, debug, and info messages with context awareness using MethodContextService and ExecutionContextService, routing logs to both a client-specific logger (via GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER) and a common logger.
 * Integrates with ClientAgent (e.g., debug logging in RUN_FN), PerfService (e.g., info logging in startExecution), and DocService (e.g., info logging in dumpDocs), controlled by GLOBAL_CONFIG logging flags (e.g., CC_LOGGER_ENABLE_DEBUG).
 * Supports runtime logger replacement via setLogger, enhancing flexibility across the system.
 */
declare class LoggerService implements ILogger {
    /**
     * Method context service instance, injected via DI, providing method-level context (e.g., clientId).
     * Used in log, debug, and info to attach method-specific metadata, aligning with ClientAgent’s method execution context.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * Execution context service instance, injected via DI, providing execution-level context (e.g., clientId).
     * Used in log, debug, and info to attach execution-specific metadata, complementing ClientAgent’s execution workflows (e.g., EXECUTE_FN).
     * @type {TExecutionContextService}
     * @private
     */
    private readonly executionContextService;
    /**
     * The common logger instance, defaults to NOOP_LOGGER, used for system-wide logging.
     * Updated via setLogger, receives all log messages alongside client-specific loggers, ensuring a fallback logging mechanism.
     * @type {ILogger}
     * @private
     */
    private _commonLogger;
    /**
     * Factory function to create a client-specific logger adapter, memoized with singleshot for efficiency.
     * Sources from GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER (defaults to LoggerAdapter), used in log, debug, and info to route client-specific logs (e.g., ClientAgent’s clientId).
     * @type {() => ILoggerAdapter}
     * @private
     */
    private getLoggerAdapter;
    /**
     * Logs messages at the normal level, routing to both the client-specific logger (if clientId exists) and the common logger.
     * Attaches method and execution context (e.g., clientId) for traceability, used across the system (e.g., PerfService’s dispose).
     * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG, defaults to enabled.
     * @param {string} topic - The topic or identifier of the log message (e.g., "perfService dispose").
     * @param {...any[]} args - The message content and optional additional data (e.g., objects, strings).
     * @returns {void}
     */
    log: (topic: string, ...args: any[]) => void;
    /**
     * Logs messages at the debug level, routing to both the client-specific logger (if clientId exists) and the common logger.
     * Attaches method and execution context for detailed debugging, heavily used in ClientAgent (e.g., RUN_FN, EXECUTE_FN) when GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG is true.
     * @param {string} topic - The topic or identifier of the debug message (e.g., "clientAgent RUN_FN").
     * @param {...any[]} args - The debug content and optional additional data (e.g., objects, strings).
     * @returns {void}
     */
    debug: (topic: string, ...args: any[]) => void;
    /**
     * Logs messages at the info level, routing to both the client-specific logger (if clientId exists) and the common logger.
     * Attaches method and execution context for informational tracking, used in PerfService (e.g., startExecution) and DocService (e.g., dumpDocs) when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * @param {string} topic - The topic or identifier of the info message (e.g., "perfService startExecution").
     * @param {...any[]} args - The info content and optional additional data (e.g., objects, strings).
     * @returns {void}
     */
    info: (topic: string, ...args: any[]) => void;
    /**
     * Sets a new common logger instance, replacing the default NOOP_LOGGER or previous logger.
     * Allows runtime customization of system-wide logging behavior, potentially used in testing or advanced configurations (e.g., redirecting logs to a file or console).
     * @param {ILogger} logger - The new logger instance to set, implementing the ILogger interface.
     * @returns {void}
     */
    setLogger: (logger: ILogger) => void;
}

declare const AGENT_CHANGE_SYMBOL: unique symbol;
declare const MODEL_RESQUE_SYMBOL: unique symbol;
declare const TOOL_ERROR_SYMBOL: unique symbol;
declare const TOOL_STOP_SYMBOL: unique symbol;
/**
 * Represents a client-side agent in the swarm system, implementing the IAgent interface.
 * Manages message execution, tool calls, history updates, and event emissions, with queued execution to prevent overlap.
 * Integrates with AgentConnectionService (instantiation), HistoryConnectionService (history), ToolSchemaService (tools), CompletionSchemaService (completions), SwarmConnectionService (swarm coordination), and BusService (events).
 * Uses Subjects from functools-kit for asynchronous state management (e.g., tool errors, agent changes).
 * @implements {IAgent}
 */
declare class ClientAgent implements IAgent {
    readonly params: IAgentParams;
    /**
     * Subject for signaling agent changes, halting subsequent tool executions via commitAgentChange.
     * @type {Subject<typeof AGENT_CHANGE_SYMBOL>}
     * @readonly
     */
    readonly _agentChangeSubject: Subject<typeof AGENT_CHANGE_SYMBOL>;
    /**
     * Subject for signaling model resurrection events, triggered by _resurrectModel during error recovery.
     * @type {Subject<typeof MODEL_RESQUE_SYMBOL>}
     * @readonly
     */
    readonly _resqueSubject: Subject<typeof MODEL_RESQUE_SYMBOL>;
    /**
     * Subject for signaling tool execution errors, emitted by createToolCall on failure.
     * @type {Subject<typeof TOOL_ERROR_SYMBOL>}
     * @readonly
     */
    readonly _toolErrorSubject: Subject<typeof TOOL_ERROR_SYMBOL>;
    /**
     * Subject for signaling tool execution stops, triggered by commitStopTools.
     * @type {Subject<typeof TOOL_STOP_SYMBOL>}
     * @readonly
     */
    readonly _toolStopSubject: Subject<typeof TOOL_STOP_SYMBOL>;
    /**
     * Subject for signaling tool output commitments, triggered by commitToolOutput.
     * @type {Subject<void>}
     * @readonly
     */
    readonly _toolCommitSubject: Subject<void>;
    /**
     * Subject for emitting transformed outputs, used by _emitOutput and waitForOutput.
     * @type {Subject<string>}
     * @readonly
     */
    readonly _outputSubject: Subject<string>;
    /**
     * Constructs a ClientAgent instance with the provided parameters.
     * Initializes event subjects and invokes the onInit callback, logging construction details if enabled.
     * @param {IAgentParams} params - The parameters for agent initialization, including clientId, agentName, completion, tools, etc.
     */
    constructor(params: IAgentParams);
    /**
     * Emits the transformed output after validation, invoking callbacks and emitting events via BusService.
     * Attempts model resurrection via _resurrectModel if validation fails, throwing an error if unrecoverable.
     * Supports SwarmConnectionService by broadcasting agent outputs within the swarm.
     * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool"), determining context.
     * @param {string} rawResult - The raw result to transform and emit, typically from getCompletion or tool execution.
     * @returns {Promise<void>} Resolves when output is emitted successfully.
     * @throws {Error} If validation fails after model resurrection, indicating an unrecoverable state.
     * @private
     */
    _emitOutput(mode: ExecutionMode, rawResult: string): Promise<void>;
    /**
     * Resurrects the model in case of failures using configured strategies (flush, recomplete, custom).
     * Updates history with failure details and returns a placeholder or transformed result, signaling via _resqueSubject.
     * Supports error recovery for CompletionSchemaService’s getCompletion calls.
     * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool"), determining context.
     * @param {string} [reason="unknown"] - The reason for resurrection, logged for debugging.
     * @returns {Promise<string>} A placeholder (for flush) or transformed result (for recomplete/custom) after recovery.
     * @private
     */
    _resurrectModel(mode: ExecutionMode, reason?: string): Promise<string>;
    /**
     * Waits for the next output to be emitted via _outputSubject, typically after execute or run.
     * Useful for external consumers (e.g., SwarmConnectionService) awaiting agent responses.
     * @returns {Promise<string>} The next transformed output emitted by the agent.
     */
    waitForOutput(): Promise<string>;
    /**
     * Retrieves a completion message from the model using the current history and tools.
     * Applies validation and resurrection strategies (via _resurrectModel) if needed, integrating with CompletionSchemaService.
     * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool"), determining context.
     * @returns {Promise<IModelMessage>} The completion message from the model, with content defaulted to an empty string if null.
     */
    getCompletion(mode: ExecutionMode): Promise<IModelMessage>;
    /**
     * Commits a user message to the history without triggering a response, notifying the system via BusService.
     * Supports SessionConnectionService by logging user interactions within a session.
     * @param {string} message - The user message to commit, trimmed before storage.
     * @returns {Promise<void>} Resolves when the message is committed to history and the event is emitted.
     */
    commitUserMessage(message: string, mode: ExecutionMode): Promise<void>;
    /**
     * Commits a flush of the agent’s history, clearing it and notifying the system via BusService.
     * Useful for resetting agent state, coordinated with HistoryConnectionService.
     * @returns {Promise<void>} Resolves when the flush is committed and the event is emitted.
     */
    commitFlush(): Promise<void>;
    /**
     * Signals an agent change to halt subsequent tool executions, emitting an event via _agentChangeSubject and BusService.
     * Supports SwarmConnectionService by allowing dynamic agent switching within a swarm.
     * @returns {Promise<void>} Resolves when the change is signaled and the event is emitted.
     */
    commitAgentChange(): Promise<void>;
    /**
     * Signals a stop to prevent further tool executions, emitting an event via _toolStopSubject and BusService.
     * Used to interrupt tool call chains, coordinated with ToolSchemaService tools.
     * @returns {Promise<void>} Resolves when the stop is signaled and the event is emitted.
     */
    commitStopTools(): Promise<void>;
    /**
     * Commits a system message to the history, notifying the system via BusService without triggering execution.
     * Supports system-level updates, coordinated with SessionConnectionService.
     * @param {string} message - The system message to commit, trimmed before storage.
     * @returns {Promise<void>} Resolves when the message is committed and the event is emitted.
     */
    commitSystemMessage(message: string): Promise<void>;
    /**
     * Commits an assistant message to the history without triggering execution, notifying the system via BusService.
     * Useful for logging assistant responses, coordinated with HistoryConnectionService.
     * @param {string} message - The assistant message to commit, trimmed before storage.
     * @returns {Promise<void>} Resolves when the message is committed and the event is emitted.
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Commits tool output to the history, signaling completion via _toolCommitSubject and notifying the system via BusService.
     * Integrates with ToolSchemaService by linking tool output to tool calls.
     * @param {string} toolId - The ID of the tool that produced the output, linking to the tool call.
     * @param {string} content - The tool output content to commit.
     * @returns {Promise<void>} Resolves when the output is committed and the event is emitted.
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Executes the incoming message and processes tool calls if present, queued to prevent overlapping executions.
     * Implements IAgent.execute, delegating to EXECUTE_FN with queuing via functools-kit’s queued decorator.
     * @param {string} incoming - The incoming message content to process.
     * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool").
     * @returns {Promise<void>} Resolves when execution completes, including tool calls and output emission.
     */
    execute: IAgent["execute"];
    /**
     * Runs a stateless completion for the incoming message, queued to prevent overlapping executions.
     * Implements IAgent.run, delegating to RUN_FN with queuing via functools-kit’s queued decorator.
     * @param {string} incoming - The incoming message content to process.
     * @returns {Promise<string>} The transformed result of the completion, or an empty string if invalid.
     */
    run: IAgent["run"];
    /**
     * Disposes of the agent, performing cleanup and invoking the onDispose callback.
     * Logs the disposal if debugging is enabled, supporting AgentConnectionService cleanup.
     * @returns {Promise<void>} Resolves when disposal is complete.
     */
    dispose(): Promise<void>;
}

/**
 * Service class for managing agent connections and operations in the swarm system.
 * Implements IAgent to provide an interface for agent instantiation, execution, message handling, and lifecycle management.
 * Integrates with ClientAgent (core agent logic), AgentPublicService (public agent API), SessionPublicService (session context), HistoryPublicService (history management), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientAgent instances by clientId and agentName, ensuring efficient reuse.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with schema services (AgentSchemaService, ToolSchemaService, CompletionSchemaService) for agent configuration, validation services (SessionValidationService) for usage tracking, and connection services (HistoryConnectionService, StorageConnectionService, StateConnectionService) for agent dependencies.
 * @implements {IAgent}
 */
declare class AgentConnectionService implements IAgent {
    /**
     * Logger service instance, injected via DI, for logging agent operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentPublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Bus service instance, injected via DI, for emitting agent-related events.
     * Passed to ClientAgent for execution events (e.g., commitExecutionBegin), aligning with BusService’s event system in SessionPublicService.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Method context service instance, injected via DI, for accessing execution context.
     * Used to retrieve clientId and agentName in method calls, integrating with MethodContextService’s scoping in AgentPublicService.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * Session validation service instance, injected via DI, for tracking agent usage.
     * Used in getAgent and dispose to manage agent lifecycle, supporting SessionPublicService’s validation needs.
     * @type {SessionValidationService}
     * @private
     */
    private readonly sessionValidationService;
    /**
     * History connection service instance, injected via DI, for managing agent history.
     * Provides history instances to ClientAgent, aligning with HistoryPublicService’s functionality.
     * @type {HistoryConnectionService}
     * @private
     */
    private readonly historyConnectionService;
    /**
     * Storage connection service instance, injected via DI, for managing agent storage.
     * Initializes storage references in getAgent, supporting StoragePublicService’s client-specific storage operations.
     * @type {StorageConnectionService}
     * @private
     */
    private readonly storageConnectionService;
    /**
     * State connection service instance, injected via DI, for managing agent state.
     * Initializes state references in getAgent, supporting StatePublicService’s client-specific state operations.
     * @type {StateConnectionService}
     * @private
     */
    private readonly stateConnectionService;
    /**
     * Agent schema service instance, injected via DI, for retrieving agent configurations.
     * Provides agent details (e.g., prompt, tools) in getAgent, aligning with AgentMetaService’s schema management.
     * @type {AgentSchemaService}
     * @private
     */
    private readonly agentSchemaService;
    /**
     * Tool schema service instance, injected via DI, for retrieving tool configurations.
     * Maps tools for ClientAgent in getAgent, supporting DocService’s tool documentation.
     * @type {ToolSchemaService}
     * @private
     */
    private readonly toolSchemaService;
    /**
     * Completion schema service instance, injected via DI, for retrieving completion configurations.
     * Provides completion logic to ClientAgent in getAgent, supporting agent execution flows.
     * @type {CompletionSchemaService}
     * @private
     */
    private readonly completionSchemaService;
    /**
     * Retrieves or creates a memoized ClientAgent instance for a given client and agent.
     * Uses functools-kit’s memoize to cache instances by a composite key (clientId-agentName), ensuring efficient reuse across calls.
     * Configures the agent with schema data (prompt, tools, completion) from AgentSchemaService, ToolSchemaService, and CompletionSchemaService, and initializes storage/state dependencies via StorageConnectionService and StateConnectionService.
     * Integrates with ClientAgent (agent logic), AgentPublicService (agent instantiation), and SessionValidationService (usage tracking).
     * @param {string} clientId - The client ID, scoping the agent to a specific client, tied to ClientAgent and PerfService tracking.
     * @param {string} agentName - The name of the agent, sourced from Agent.interface, used in AgentSchemaService lookups.
     * @returns {ClientAgent} The memoized ClientAgent instance configured for the client and agent.
     */
    getAgent: ((clientId: string, agentName: string) => ClientAgent) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientAgent>;
    /**
     * Executes an input command on the agent in a specified execution mode.
     * Delegates to ClientAgent.execute, using context from MethodContextService to identify the agent, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors AgentPublicService’s execute, supporting ClientAgent’s EXECUTE_FN and PerfService’s tracking.
     * @param {string} input - The input command to execute.
     * @param {ExecutionMode} mode - The execution mode (e.g., stateless, stateful), sourced from Session.interface.
     * @returns {Promise<any>} A promise resolving to the execution result, type determined by ClientAgent’s implementation.
     */
    execute: (input: string, mode: ExecutionMode) => Promise<void>;
    /**
     * Runs a stateless completion on the agent with the given input.
     * Delegates to ClientAgent.run, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors AgentPublicService’s run, supporting ClientAgent’s RUN_FN for quick completions.
     * @param {string} input - The input command to run.
     * @returns {Promise<any>} A promise resolving to the completion result, type determined by ClientAgent’s implementation.
     */
    run: (input: string) => Promise<string>;
    /**
     * Waits for output from the agent, typically after an execution or run.
     * Delegates to ClientAgent.waitForOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Aligns with SessionPublicService’s waitForOutput and ClientAgent’s asynchronous output handling.
     * @returns {Promise<any>} A promise resolving to the output result, type determined by ClientAgent’s implementation.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Commits tool output to the agent’s history, typically for OpenAI-style tool calls.
     * Delegates to ClientAgent.commitToolOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitToolOutput, supporting ClientAgent’s TOOL_EXECUTOR and HistoryPublicService.
     * @param {string} toolId - The tool_call_id for OpenAI history integration.
     * @param {string} content - The tool output content to commit.
     * @returns {Promise<any>} A promise resolving to the commit result, type determined by ClientAgent’s implementation.
     */
    commitToolOutput: (toolId: string, content: string) => Promise<void>;
    /**
     * Commits a system message to the agent’s history.
     * Delegates to ClientAgent.commitSystemMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitSystemMessage, supporting ClientAgent’s system prompt updates and HistoryPublicService.
     * @param {string} message - The system message to commit.
     * @returns {Promise<any>} A promise resolving to the commit result, type determined by ClientAgent’s implementation.
     */
    commitSystemMessage: (message: string) => Promise<void>;
    /**
     * Commits an assistant message to the agent’s history.
     * Delegates to ClientAgent.commitAssistantMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitAssistantMessage, supporting ClientAgent’s assistant responses and HistoryPublicService.
     * @param {string} message - The assistant message to commit.
     * @returns {Promise<any>} A promise resolving to the commit result, type determined by ClientAgent’s implementation.
     */
    commitAssistantMessage: (message: string) => Promise<void>;
    /**
     * Commits a user message to the agent’s history without triggering a response.
     * Delegates to ClientAgent.commitUserMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitUserMessage, supporting ClientAgent’s user input logging and HistoryPublicService.
     * @param {string} message - The user message to commit.
     * @returns {Promise<any>} A promise resolving to the commit result, type determined by ClientAgent’s implementation.
     */
    commitUserMessage: (message: string, mode: ExecutionMode) => Promise<void>;
    /**
     * Commits an agent change to prevent the next tool execution, altering the execution flow.
     * Delegates to ClientAgent.commitAgentChange, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent’s execution control, potentially tied to SwarmPublicService’s navigation changes.
     * @returns {Promise<any>} A promise resolving to the commit result, type determined by ClientAgent’s implementation.
     */
    commitAgentChange: () => Promise<void>;
    /**
     * Prevents the next tool from being executed in the agent’s workflow.
     * Delegates to ClientAgent.commitStopTools, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitStopTools, supporting ClientAgent’s TOOL_EXECUTOR interruption.
     * @returns {Promise<any>} A promise resolving to the commit result, type determined by ClientAgent’s implementation.
     */
    commitStopTools: () => Promise<void>;
    /**
     * Commits a flush of the agent’s history, clearing stored data.
     * Delegates to ClientAgent.commitFlush, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitFlush, supporting ClientAgent’s history reset and HistoryPublicService.
     * @returns {Promise<any>} A promise resolving to the commit result, type determined by ClientAgent’s implementation.
     */
    commitFlush: () => Promise<void>;
    /**
     * Disposes of the agent connection, cleaning up resources and clearing the memoized instance.
     * Checks if the agent exists in the memoization cache before calling ClientAgent.dispose, then clears the cache and updates SessionValidationService.
     * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with AgentPublicService’s dispose and PerfService’s cleanup.
     * @returns {Promise<void>} A promise resolving when the agent connection is disposed.
     */
    dispose: () => Promise<void>;
}

/**
 * Class representing the history of client messages in the swarm system, implementing the IHistory interface.
 * Manages storage, retrieval, and filtering of messages for an agent, with event emission via BusService.
 * Integrates with HistoryConnectionService (history instantiation), ClientAgent (message logging and completion context),
 * BusService (event emission), and SessionConnectionService (session history tracking).
 * Uses a filter condition from GLOBAL_CONFIG to tailor message arrays for agent-specific needs, with limits and transformations.
 * @implements {IHistory}
 */
declare class ClientHistory implements IHistory {
    readonly params: IHistoryParams;
    /**
     * Filter condition function for toArrayForAgent, used to filter messages based on agent-specific criteria.
     * Initialized from GLOBAL_CONFIG.CC_AGENT_HISTORY_FILTER, applied to common messages to exclude irrelevant entries.
     * @type {(message: IModelMessage) => boolean}
     */
    _filterCondition: (message: IModelMessage) => boolean;
    /**
     * Constructs a ClientHistory instance with the provided parameters.
     * Initializes the filter condition using GLOBAL_CONFIG.CC_AGENT_HISTORY_FILTER and logs construction if debugging is enabled.
     * @param {IHistoryParams} params - The parameters for initializing the history, including clientId, agentName, items, bus, and logger.
     */
    constructor(params: IHistoryParams);
    /**
     * Pushes a message into the history and emits a corresponding event via BusService.
     * Adds the message to the underlying storage (params.items) and notifies the system, supporting ClientAgent’s history updates.
     * @param {IModelMessage} message - The message to add to the history, sourced from ModelMessage.model.
     * @returns {Promise<void>} Resolves when the message is stored and the event is emitted.
     */
    push<Payload extends object = object>(message: IModelMessage<Payload>): Promise<void>;
    /**
     * Removes and returns the most recent message from the history, emitting an event via BusService.
     * Retrieves the message from params.items and notifies the system, returning null if the history is empty.
     * Useful for ClientAgent to undo recent actions or inspect the latest entry.
     * @returns {Promise<IModelMessage | null>} The most recent message, or null if the history is empty.
     */
    pop(): Promise<IModelMessage | null>;
    /**
     * Converts the history into an array of raw messages without filtering or transformation.
     * Iterates over params.items to collect all messages as-is, useful for debugging or raw data access.
     * @returns {Promise<IModelMessage[]>} An array of raw messages in the history, sourced from ModelMessage.model.
     */
    toArrayForRaw(): Promise<IModelMessage[]>;
    /**
     * Converts the history into an array of messages tailored for the agent, used by ClientAgent for completions.
     * Filters messages with _filterCondition, limits to GLOBAL_CONFIG.CC_KEEP_MESSAGES, handles resque/flush resets,
     * and prepends prompt and system messages (from params and GLOBAL_CONFIG.CC_AGENT_SYSTEM_PROMPT).
     * Ensures tool call consistency by linking tool outputs to calls, supporting CompletionSchemaService’s context needs.
     * @param {string} prompt - The initial prompt message to prepend as a system message.
     * @param {string[] | undefined} system - Optional array of additional system messages to prepend.
     * @returns {Promise<IModelMessage[]>} An array of filtered and transformed messages formatted for the agent.
     */
    toArrayForAgent(prompt: string, system?: string[]): Promise<IModelMessage[]>;
    /**
     * Disposes of the history, releasing resources and performing cleanup via params.items.dispose.
     * Called when the agent (e.g., ClientAgent) is disposed, ensuring proper resource management with HistoryConnectionService.
     * @returns {Promise<void>} Resolves when the history resources are fully released.
     */
    dispose(): Promise<void>;
}

/**
 * Service class for managing history connections and operations in the swarm system.
 * Implements IHistory to provide an interface for history instance management, message manipulation, and conversion, scoped to clientId and agentName.
 * Integrates with ClientAgent (history in agent execution), AgentConnectionService (history provision), HistoryPublicService (public history API), SessionPublicService (session context), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientHistory instances by a composite key (clientId-agentName), ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with SessionValidationService for usage tracking and BusService for event emission.
 * @implements {IHistory}
 */
declare class HistoryConnectionService implements IHistory {
    /**
     * Logger service instance, injected via DI, for logging history operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with HistoryPublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Bus service instance, injected via DI, for emitting history-related events.
     * Passed to ClientHistory for event propagation (e.g., history updates), aligning with BusService’s event system in AgentConnectionService.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Method context service instance, injected via DI, for accessing execution context.
     * Used to retrieve clientId and agentName in method calls, integrating with MethodContextService’s scoping in HistoryPublicService.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * Session validation service instance, injected via DI, for tracking history usage.
     * Used in getHistory and dispose to manage history lifecycle, supporting SessionPublicService’s validation needs.
     * @type {SessionValidationService}
     * @private
     */
    private readonly sessionValidationService;
    /**
     * Retrieves or creates a memoized ClientHistory instance for a given client and agent.
     * Uses functools-kit’s memoize to cache instances by a composite key (clientId-agentName), ensuring efficient reuse across calls.
     * Initializes the history with items from GLOBAL_CONFIG.CC_GET_AGENT_HISTORY_ADAPTER, and integrates with SessionValidationService for usage tracking.
     * Supports ClientAgent (history in EXECUTE_FN), AgentConnectionService (history provision), and HistoryPublicService (public API).
     * @param {string} clientId - The client ID, scoping the history to a specific client, tied to ClientAgent and PerfService tracking.
     * @param {string} agentName - The name of the agent, sourced from Agent.interface, used for history scoping.
     * @returns {ClientHistory} The memoized ClientHistory instance configured for the client and agent.
     */
    getHistory: ((clientId: string, agentName: string) => ClientHistory) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientHistory>;
    /**
     * Pushes a message to the agent’s history.
     * Delegates to ClientHistory.push, using context from MethodContextService to identify the history instance, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors HistoryPublicService’s push, supporting ClientAgent’s history updates (e.g., via commit methods in AgentConnectionService).
     * @param {IModelMessage} message - The message to push, sourced from ModelMessage.model, typically containing role and content.
     * @returns {Promise<void>} A promise resolving when the message is pushed to the history.
     */
    push: (message: IModelMessage) => Promise<void>;
    /**
     * Pops the most recent message from the agent’s history.
     * Delegates to ClientHistory.pop, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors HistoryPublicService’s pop, supporting ClientAgent’s history manipulation.
     * @returns {Promise<IModelMessage | null>} A promise resolving to the popped message or null if the history is empty.
     */
    pop: () => Promise<IModelMessage<object>>;
    /**
     * Converts the agent’s history to an array formatted for agent use, incorporating a prompt.
     * Delegates to ClientHistory.toArrayForAgent, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors HistoryPublicService’s toArrayForAgent, supporting ClientAgent’s execution context (e.g., EXECUTE_FN with prompt).
     * @param {string} prompt - The prompt to incorporate into the formatted history array.
     * @returns {Promise<any[]>} A promise resolving to an array formatted for agent use, type determined by ClientHistory’s implementation.
     */
    toArrayForAgent: (prompt: string) => Promise<IModelMessage<object>[]>;
    /**
     * Converts the agent’s history to a raw array of messages.
     * Delegates to ClientHistory.toArrayForRaw, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors HistoryPublicService’s toArrayForRaw, supporting ClientAgent’s raw history access or external reporting.
     * @returns {Promise<any[]>} A promise resolving to a raw array of history items, type determined by ClientHistory’s implementation.
     */
    toArrayForRaw: () => Promise<IModelMessage<object>[]>;
    /**
     * Disposes of the history connection, cleaning up resources and clearing the memoized instance.
     * Checks if the history exists in the memoization cache before calling ClientHistory.dispose, then clears the cache and updates SessionValidationService.
     * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with HistoryPublicService’s dispose and PerfService’s cleanup.
     * @returns {Promise<void>} A promise resolving when the history connection is disposed.
     */
    dispose: () => Promise<void>;
}

/**
 * Service class for managing agent schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IAgentSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with AgentConnectionService (agent instantiation using schemas), SwarmConnectionService (swarm agent configuration), ClientAgent (schema-driven execution), and AgentMetaService (meta-level agent management).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining agent behavior, dependencies, and resources (e.g., states, storages, tools) within the swarm ecosystem.
 */
declare class AgentSchemaService {
    /**
     * Logger service instance, injected via DI, for logging schema operations.
     * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentConnectionService and PerfService logging patterns.
     * @type {LoggerService}
     * @readonly
     */
    readonly loggerService: LoggerService;
    /**
     * Registry instance for storing agent schemas, initialized with ToolRegistry from functools-kit.
     * Maps AgentName keys to IAgentSchema values, providing efficient storage and retrieval, used in register and get methods.
     * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
     * @type {ToolRegistry<Record<AgentName, IAgentSchema>>}
     * @private
     */
    private registry;
    /**
     * Validates an agent schema shallowly, ensuring required fields and array properties meet basic integrity constraints.
     * Checks agentName, completion, and prompt as strings; ensures system, dependsOn, states, storages, and tools are arrays of unique strings if present.
     * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s validation needs.
     * Supports ClientAgent instantiation by ensuring schema validity before registration.
     * @param {IAgentSchema} agentSchema - The agent schema to validate, sourced from Agent.interface.
     * @throws {Error} If any validation check fails, with detailed messages including agentName and invalid values.
     * @private
     */
    private validateShallow;
    /**
     * Registers a new agent schema in the registry after validation.
     * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (agentName).
     * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s schema usage.
     * Supports ClientAgent instantiation by providing validated schemas to AgentConnectionService and SwarmConnectionService.
     * @param {AgentName} key - The name of the agent, used as the registry key, sourced from Agent.interface.
     * @param {IAgentSchema} value - The agent schema to register, sourced from Agent.interface, validated before storage.
     * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
     */
    register: (key: AgentName, value: IAgentSchema) => void;
    /**
     * Retrieves an agent schema from the registry by its name.
     * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports AgentConnectionService’s getAgent method by providing schema data for agent instantiation, and SwarmConnectionService’s swarm configuration.
     * @param {AgentName} key - The name of the agent to retrieve, sourced from Agent.interface.
     * @returns {IAgentSchema} The agent schema associated with the key, sourced from Agent.interface.
     * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
     */
    get: (key: AgentName) => IAgentSchema;
}

/**
 * Service class for managing tool schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IAgentTool instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with AgentSchemaService (tool references in agent schemas via the tools field), ClientAgent (tool usage during execution), AgentConnectionService (agent instantiation with tools), and SwarmConnectionService (swarm-level agent execution).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining agent tools (e.g., call, validate, function properties) used by agents to perform specific tasks within the swarm ecosystem.
 */
declare class ToolSchemaService {
    /**
     * Logger service instance, injected via DI, for logging tool schema operations.
     * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentConnectionService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Registry instance for storing tool schemas, initialized with ToolRegistry from functools-kit.
     * Maps ToolName keys to IAgentTool values, providing efficient storage and retrieval, used in register and get methods.
     * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
     * @type {ToolRegistry<Record<ToolName, IAgentTool>>}
     * @private
     */
    private registry;
    /**
     * Validates a tool schema shallowly, ensuring required fields meet basic integrity constraints.
     * Checks toolName as a string, call and validate as functions (for tool execution and input validation), and function as an object (tool metadata), using isObject from functools-kit.
     * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s tool integration needs.
     * Supports ClientAgent execution by ensuring tool schema validity before registration.
     * @param {IAgentTool} toolSchema - The tool schema to validate, sourced from Agent.interface.
     * @throws {Error} If any validation check fails, with detailed messages including toolName.
     * @private
     */
    private validateShallow;
    /**
     * Registers a new tool schema in the registry after validation.
     * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (toolName).
     * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentSchemaService’s tool references.
     * Supports ClientAgent execution by providing validated tool schemas to AgentConnectionService and SwarmConnectionService for agent tool integration.
     * @param {ToolName} key - The name of the tool, used as the registry key, sourced from Agent.interface.
     * @param {IAgentTool} value - The tool schema to register, sourced from Agent.interface, validated before storage.
     * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
     */
    register: (key: ToolName, value: IAgentTool) => void;
    /**
     * Retrieves a tool schema from the registry by its name.
     * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports AgentConnectionService by providing tool definitions (e.g., call, validate, function) for agent instantiation, referenced in AgentSchemaService schemas via the tools field.
     * @param {ToolName} key - The name of the tool to retrieve, sourced from Agent.interface.
     * @returns {IAgentTool} The tool schema associated with the key, sourced from Agent.interface, including call, validate, and function properties.
     * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
     */
    get: (key: ToolName) => IAgentTool;
}

declare const AGENT_NEED_FETCH: unique symbol;
declare const STACK_NEED_FETCH: unique symbol;
/**
 * Manages a collection of agents within a swarm in the swarm system, implementing the ISwarm interface.
 * Handles agent switching, output waiting, and navigation stack management, with queued operations and event-driven updates via BusService.
 * Integrates with SwarmConnectionService (swarm instantiation), ClientSession (agent execution/output), ClientAgent (agent instances),
 * SwarmSchemaService (swarm structure), and BusService (event emission).
 * Uses Subjects for agent change notifications and output cancellation, ensuring coordinated agent interactions.
 * @implements {ISwarm}
 */
declare class ClientSwarm implements ISwarm {
    readonly params: ISwarmParams;
    /**
     * Subject that emits when an agent reference changes, providing the agent name and instance.
     * Used by setAgentRef to notify subscribers (e.g., waitForOutput) of updates to agent instances.
     * @type {Subject<[agentName: AgentName, agent: IAgent]>}
     */
    _agentChangedSubject: Subject<[agentName: string, agent: IAgent]>;
    /**
     * The name of the currently active agent, or a symbol indicating it needs to be fetched.
     * Initialized as AGENT_NEED_FETCH, lazily populated by getAgentName via params.getActiveAgent.
     * Updated by setAgentName, persisted via params.setActiveAgent.
     * @type {AgentName | typeof AGENT_NEED_FETCH}
     */
    _activeAgent: AgentName | typeof AGENT_NEED_FETCH;
    /**
     * The navigation stack of agent names, or a symbol indicating it needs to be fetched.
     * Initialized as STACK_NEED_FETCH, lazily populated by navigationPop via params.getNavigationStack.
     * Updated by setAgentName (push) and navigationPop (pop), persisted via params.setNavigationStack.
     * @type {AgentName[] | typeof STACK_NEED_FETCH}
     */
    _navigationStack: AgentName[] | typeof STACK_NEED_FETCH;
    /**
     * Subject for emitting output messages to subscribers, used by emit and connect methods.
     * Provides an asynchronous stream of validated messages, supporting real-time updates to external connectors.
     * @type {Subject<string>}
     * @readonly
     */
    readonly _emitSubject: Subject<string>;
    /**
     * Subject that emits to cancel output waiting, providing an empty output string and agent name.
     * Triggered by cancelOutput to interrupt waitForOutput, ensuring responsive cancellation.
     * @type {Subject<{ agentName: string; output: string }>}
     */
    _cancelOutputSubject: Subject<{
        agentName: string;
        output: string;
    }>;
    /**
     * Getter for the list of agent name-agent pairs from the agent map (params.agentMap).
     * Provides a snapshot of available agents, used internally by waitForOutput to monitor outputs.
     * @returns {[string, IAgent][]} An array of tuples containing agent names and their instances, sourced from Agent.interface.
     */
    get _agentList(): [string, IAgent][];
    /**
     * Constructs a ClientSwarm instance with the provided parameters.
     * Initializes Subjects and logs construction if debugging is enabled, setting up the swarm structure.
     * @param {ISwarmParams} params - The parameters for initializing the swarm, including clientId, swarmName, agentMap, getActiveAgent, etc.
     */
    constructor(params: ISwarmParams);
    /**
     * Emits a message to subscribers via _emitSubject after validating it against the policy (ClientPolicy).
     * Emits the ban message if validation fails, notifying subscribers and logging via BusService.
     * Supports SwarmConnectionService by broadcasting session outputs within the swarm.
     * @param {string} message - The message to emit, typically an agent response or tool output.
     * @returns {Promise<void>} Resolves when the message (or ban message) is emitted and the event is logged.
     */
    emit(message: string): Promise<void>;
    /**
     * Pops the most recent agent from the navigation stack, falling back to the default agent if empty.
     * Updates and persists the stack via params.setNavigationStack, supporting ClientSession’s agent navigation.
     * @returns {Promise<string>} The name of the previous agent, or params.defaultAgent if the stack is empty.
     */
    navigationPop(): Promise<string>;
    /**
     * Cancels the current output wait by emitting an empty string via _cancelOutputSubject, logging via BusService.
     * Interrupts waitForOutput, ensuring responsive cancellation for ClientSession’s execution flow.
     * @returns {Promise<void>} Resolves when the cancellation is emitted and logged.
     */
    cancelOutput(): Promise<void>;
    /**
     * Waits for output from the active agent in a queued manner, delegating to WAIT_FOR_OUTPUT_FN.
     * Ensures only one wait operation runs at a time, handling cancellation and agent changes, supporting ClientSession’s output retrieval.
     * @returns {Promise<string>} The output from the active agent, or an empty string if canceled.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Retrieves the name of the active agent, lazily fetching it via params.getActiveAgent if not loaded.
     * Emits an event via BusService with the result, supporting ClientSession’s agent identification.
     * @returns {Promise<AgentName>} The name of the active agent, sourced from Agent.interface.
     */
    getAgentName(): Promise<AgentName>;
    /**
     * Retrieves the active agent instance (ClientAgent) based on its name from params.agentMap.
     * Emits an event via BusService with the result, supporting ClientSession’s execution and history operations.
     * @returns {Promise<IAgent>} The active agent instance, sourced from Agent.interface.
     */
    getAgent(): Promise<IAgent>;
    /**
     * Updates the reference to an agent in the swarm’s agent map (params.agentMap), notifying subscribers via _agentChangedSubject.
     * Emits an event via BusService, supporting dynamic agent updates within ClientSession’s execution flow.
     * @param {AgentName} agentName - The name of the agent to update, sourced from Agent.interface.
     * @param {IAgent} agent - The new agent instance (ClientAgent) to set.
     * @throws {Error} If the agent name is not found in params.agentMap, indicating an invalid agent.
     * @returns {Promise<void>} Resolves when the agent reference is updated, emitted, and subscribers are notified.
     */
    setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
    /**
     * Sets the active agent by name, updates the navigation stack, and persists the change via params.setActiveAgent/setNavigationStack.
     * Invokes the onAgentChanged callback and emits an event via BusService, supporting ClientSession’s agent switching.
     * @param {AgentName} agentName - The name of the agent to set as active, sourced from Agent.interface.
     * @returns {Promise<void>} Resolves when the agent is set, stack is updated, and the event is logged.
     */
    setAgentName(agentName: AgentName): Promise<void>;
}

/**
 * Service class for managing swarm connections and operations in the swarm system.
 * Implements ISwarm to provide an interface for swarm instance management, agent navigation, output handling, and lifecycle operations, scoped to clientId and swarmName.
 * Integrates with ClientAgent (agent execution within swarms), SwarmPublicService (public swarm API), AgentConnectionService (agent management), SessionConnectionService (session-swarm linking), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientSwarm instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with SwarmSchemaService for swarm configuration and AgentConnectionService for agent instantiation, applying persistence via PersistSwarmAdapter or defaults from GLOBAL_CONFIG.
 * @implements {ISwarm}
 */
declare class SwarmConnectionService implements ISwarm {
    /**
     * Logger service instance, injected via DI, for logging swarm operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SwarmPublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Bus service instance, injected via DI, for emitting swarm-related events.
     * Passed to ClientSwarm for event propagation (e.g., agent changes), aligning with BusService’s event system in AgentConnectionService.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Method context service instance, injected via DI, for accessing execution context.
     * Used to retrieve clientId and swarmName in method calls, integrating with MethodContextService’s scoping in SwarmPublicService.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * Agent connection service instance, injected via DI, for managing agent instances.
     * Provides agent instances to ClientSwarm in getSwarm, supporting AgentPublicService and ClientAgent integration.
     * @type {AgentConnectionService}
     * @private
     */
    private readonly agentConnectionService;
    /**
     * Swarm schema service instance, injected via DI, for retrieving swarm configurations.
     * Provides configuration (e.g., agentList, defaultAgent) to ClientSwarm in getSwarm, aligning with SwarmMetaService’s schema management.
     * @type {SwarmSchemaService}
     * @private
     */
    private readonly swarmSchemaService;
    /**
     * Retrieves or creates a memoized ClientSwarm instance for a given client and swarm name.
     * Uses functools-kit’s memoize to cache instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
     * Configures the swarm with schema data from SwarmSchemaService, agent instances from AgentConnectionService, and persistence via PersistSwarmAdapter or defaults from GLOBAL_CONFIG.
     * Supports ClientAgent (agent execution within swarms), SessionConnectionService (swarm access in sessions), and SwarmPublicService (public API).
     * @param {string} clientId - The client ID, scoping the swarm to a specific client, tied to Session.interface and PerfService tracking.
     * @param {string} swarmName - The name of the swarm, sourced from Swarm.interface, used in SwarmSchemaService lookups.
     * @returns {ClientSwarm} The memoized ClientSwarm instance configured for the client and swarm.
     */
    getSwarm: ((clientId: string, swarmName: string) => ClientSwarm) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientSwarm>;
    /**
     * Emits a message to the session, typically for asynchronous communication.
     * Delegates to ClientSession.emit, using context from MethodContextService to identify the session, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s emit, supporting ClientAgent’s output handling and SwarmPublicService’s messaging.
     * @param {string} content - The content to emit to the session.
     * @returns {Promise<void>} A promise resolving when the message is emitted.
     */
    emit: (message: string) => Promise<void>;
    /**
     * Pops the navigation stack or returns the default agent if the stack is empty.
     * Delegates to ClientSwarm.navigationPop, using context from MethodContextService to identify the swarm, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SwarmPublicService’s navigationPop, supporting ClientAgent’s navigation within swarms.
     * @returns {Promise<string>} A promise resolving to the pending agent name for navigation.
     */
    navigationPop: () => Promise<string>;
    /**
     * Cancels the pending output by emitting an empty string, interrupting waitForOutput.
     * Delegates to ClientSwarm.cancelOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SwarmPublicService’s cancelOutput, supporting ClientAgent’s output control.
     * @returns {Promise<void>} A promise resolving when the output is canceled.
     */
    cancelOutput: () => Promise<void>;
    /**
     * Waits for and retrieves the output from the swarm’s active agent.
     * Delegates to ClientSwarm.waitForOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SwarmPublicService’s waitForOutput, supporting ClientAgent’s output retrieval, typically a string from agent execution.
     * @returns {Promise<string>} A promise resolving to the output from the swarm’s active agent, typically a string.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Retrieves the name of the currently active agent in the swarm.
     * Delegates to ClientSwarm.getAgentName, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SwarmPublicService’s getAgentName, supporting ClientAgent’s agent tracking.
     * @returns {Promise<string>} A promise resolving to the name of the active agent.
     */
    getAgentName: () => Promise<string>;
    /**
     * Retrieves the currently active agent instance from the swarm.
     * Delegates to ClientSwarm.getAgent, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SwarmPublicService’s getAgent, supporting ClientAgent’s agent access.
     * @returns {Promise<IAgent>} A promise resolving to the active agent instance, implementing IAgent.
     */
    getAgent: () => Promise<IAgent>;
    /**
     * Sets an agent reference in the swarm’s agent map, typically for dynamic agent addition.
     * Delegates to ClientSwarm.setAgentRef, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SwarmPublicService’s setAgentRef, supporting ClientAgent’s agent management.
     * @param {AgentName} agentName - The name of the agent to set, sourced from Agent.interface.
     * @param {IAgent} agent - The agent instance to register, implementing IAgent.
     * @returns {Promise<void>} A promise resolving when the agent reference is set.
     */
    setAgentRef: (agentName: AgentName, agent: IAgent) => Promise<void>;
    /**
     * Sets the active agent in the swarm by name, updating the navigation state.
     * Delegates to ClientSwarm.setAgentName, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SwarmPublicService’s setAgentName, supporting ClientAgent’s navigation control.
     * @param {AgentName} agentName - The name of the agent to set as active, sourced from Agent.interface.
     * @returns {Promise<void>} A promise resolving when the active agent is set.
     */
    setAgentName: (agentName: AgentName) => Promise<void>;
    /**
     * Disposes of the swarm connection, clearing the memoized instance.
     * Checks if the swarm exists in the memoization cache before clearing it, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Aligns with SwarmPublicService’s dispose and PerfService’s cleanup, but does not call ClientSwarm.dispose (assuming cleanup is handled internally or unnecessary).
     * @returns {Promise<void>} A promise resolving when the swarm connection is disposed.
     */
    dispose: () => Promise<void>;
}

/**
 * Service class for managing swarm schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving ISwarmSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with SwarmConnectionService (swarm configuration for ClientSwarm), AgentConnectionService (agent list instantiation), PolicySchemaService (policy references), ClientAgent (swarm-coordinated execution), SessionConnectionService (session-swarm linking), and SwarmPublicService (public swarm API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining swarm configurations (e.g., agentList, defaultAgent, policies) used to orchestrate agents within the swarm ecosystem.
 */
declare class SwarmSchemaService {
    /**
     * Logger service instance, injected via DI, for logging swarm schema operations.
     * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SwarmConnectionService and PerfService logging patterns.
     * @type {LoggerService}
     * @readonly
     */
    readonly loggerService: LoggerService;
    /**
     * Registry instance for storing swarm schemas, initialized with ToolRegistry from functools-kit.
     * Maps SwarmName keys to ISwarmSchema values, providing efficient storage and retrieval, used in register and get methods.
     * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
     * @type {ToolRegistry<Record<SwarmName, ISwarmSchema>>}
     * @private
     */
    private registry;
    /**
     * Validates a swarm schema shallowly, ensuring required fields and optional properties meet basic integrity constraints.
     * Checks swarmName and defaultAgent as strings, agentList as an array of unique strings (AgentName references), and policies, if present, as an array of unique strings (PolicyName references).
     * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SwarmConnectionService’s configuration needs.
     * Supports ClientSwarm instantiation in SwarmConnectionService by ensuring schema validity before registration.
     * @param {ISwarmSchema} swarmSchema - The swarm schema to validate, sourced from Swarm.interface.
     * @throws {Error} If any validation check fails, with detailed messages including swarmName and invalid values.
     * @private
     */
    private validateShallow;
    /**
     * Registers a new swarm schema in the registry after validation.
     * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (swarmName).
     * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SwarmConnectionService’s swarm management.
     * Supports ClientAgent execution by providing validated swarm schemas to SwarmConnectionService for ClientSwarm configuration.
     * @param {SwarmName} key - The name of the swarm, used as the registry key, sourced from Swarm.interface.
     * @param {ISwarmSchema} value - The swarm schema to register, sourced from Swarm.interface, validated before storage.
     * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
     */
    register: (key: SwarmName, value: ISwarmSchema) => void;
    /**
     * Retrieves a swarm schema from the registry by its name.
     * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports SwarmConnectionService by providing swarm configuration (e.g., agentList, defaultAgent, policies) for ClientSwarm instantiation, linking to AgentConnectionService and PolicySchemaService.
     * @param {SwarmName} key - The name of the swarm to retrieve, sourced from Swarm.interface.
     * @returns {ISwarmSchema} The swarm schema associated with the key, sourced from Swarm.interface, including agentList, defaultAgent, and optional policies.
     * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
     */
    get: (key: SwarmName) => ISwarmSchema;
}

/**
 * Service class for managing completion schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving ICompletionSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with AgentSchemaService (completions referenced in agent schemas), ClientAgent (execution using completion functions), AgentConnectionService (agent instantiation with completions), and SwarmConnectionService (swarm-level agent execution).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining completion logic (e.g., getCompletion functions) used by agents within the swarm ecosystem.
 */
declare class CompletionSchemaService {
    /**
     * Logger service instance, injected via DI, for logging completion schema operations.
     * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentSchemaService and PerfService logging patterns.
     * @type {LoggerService}
     * @readonly
     */
    readonly loggerService: LoggerService;
    /**
     * Registry instance for storing completion schemas, initialized with ToolRegistry from functools-kit.
     * Maps CompletionName keys to ICompletionSchema values, providing efficient storage and retrieval, used in register and get methods.
     * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
     * @type {ToolRegistry<Record<CompletionName, ICompletionSchema>>}
     * @private
     */
    private registry;
    /**
     * Validates a completion schema shallowly, ensuring required fields meet basic integrity constraints.
     * Checks completionName as a string and getCompletion as a function, critical for agent execution in ClientAgent.
     * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s schema-driven needs.
     * Supports ClientAgent execution by ensuring completion schema validity before registration.
     * @param {ICompletionSchema} completionSchema - The completion schema to validate, sourced from Completion.interface.
     * @throws {Error} If any validation check fails, with detailed messages including completionName.
     * @private
     */
    private validateShallow;
    /**
     * Registers a new completion schema in the registry after validation.
     * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (completionName).
     * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentSchemaService’s completion references.
     * Supports ClientAgent execution by providing validated completion schemas to AgentConnectionService and SwarmConnectionService.
     * @param {CompletionName} key - The name of the completion, used as the registry key, sourced from Completion.interface.
     * @param {ICompletionSchema} value - The completion schema to register, sourced from Completion.interface, validated before storage.
     * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
     */
    register: (key: CompletionName, value: ICompletionSchema) => void;
    /**
     * Retrieves a completion schema from the registry by its name.
     * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports AgentConnectionService’s agent instantiation by providing completion logic (getCompletion) referenced in AgentSchemaService schemas, and ClientAgent’s execution flow.
     * @param {CompletionName} key - The name of the completion to retrieve, sourced from Completion.interface.
     * @returns {ICompletionSchema} The completion schema associated with the key, sourced from Completion.interface, including the getCompletion function.
     * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
     */
    get: (key: CompletionName) => ICompletionSchema;
}

/**
 * Represents a client session in the swarm system, implementing the ISession interface.
 * Manages message execution, emission, and agent interactions for a client within a swarm, with policy enforcement via ClientPolicy
 * and event-driven communication via BusService. Uses a Subject for output emission to subscribers.
 * Integrates with SessionConnectionService (session instantiation), SwarmConnectionService (agent/swarm access via SwarmSchemaService),
 * ClientAgent (execution/history), ClientPolicy (validation), and BusService (event emission).
 * @implements {ISession}
 */
declare class ClientSession implements ISession {
    readonly params: ISessionParams;
    /**
     * Constructs a new ClientSession instance with the provided parameters.
     * Invokes the onInit callback if defined and logs construction if debugging is enabled.
     * @param {ISessionParams} params - The parameters for initializing the session, including clientId, swarmName, swarm, policy, bus, etc.
     */
    constructor(params: ISessionParams);
    /**
     * Emits a message to subscribers via swarm _emitSubject after validating it against the policy (ClientPolicy).
     * Emits the ban message if validation fails, notifying subscribers and logging via BusService.
     * Supports SwarmConnectionService by broadcasting session outputs within the swarm.
     * @param {string} message - The message to emit, typically an agent response or tool output.
     * @returns {Promise<void>} Resolves when the message (or ban message) is emitted and the event is logged.
     */
    emit(message: string): Promise<void>;
    /**
     * Executes a message using the swarm's agent (ClientAgent) and returns the output after policy validation.
     * Validates input and output via ClientPolicy, returning a ban message if either fails, with event logging via BusService.
     * Coordinates with SwarmConnectionService to fetch the agent and wait for output, supporting session-level execution.
     * @param {string} message - The message to execute, typically from a user or tool.
     * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool"), determining context.
     * @returns {Promise<string>} The output of the execution, or a ban message if validation fails.
     */
    execute(message: string, mode: ExecutionMode): Promise<string>;
    /**
     * Runs a stateless completion of a message using the swarm's agent (ClientAgent) and returns the output.
     * Does not emit the result but logs the execution via BusService, bypassing output validation for stateless use cases.
     * Integrates with SwarmConnectionService to access the agent, supporting lightweight completions.
     * @param {string} message - The message to run, typically from a user or tool.
     * @returns {Promise<string>} The output of the completion, without emission or output validation.
     */
    run(message: string): Promise<string>;
    /**
     * Commits tool output to the agent's history via the swarm’s agent (ClientAgent), logging the action via BusService.
     * Supports ToolSchemaService by linking tool output to tool calls, integrating with ClientAgent’s history management.
     * @param {string} toolId - The ID of the tool call (e.g., tool_call_id for OpenAI history), linking to the tool execution.
     * @param {string} content - The tool output content to commit.
     * @returns {Promise<void>} Resolves when the output is committed and the event is logged.
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Commits a user message to the agent’s history via the swarm’s agent (ClientAgent) without triggering a response.
     * Logs the action via BusService, supporting SessionConnectionService’s session history tracking.
     * @param {string} message - The user message to commit, typically from client input.
     * @returns {Promise<void>} Resolves when the message is committed and the event is logged.
     */
    commitUserMessage(message: string, mode: ExecutionMode): Promise<void>;
    /**
     * Commits a flush of the agent’s history via the swarm’s agent (ClientAgent), clearing it and logging via BusService.
     * Useful for resetting session state, coordinated with ClientHistory via ClientAgent.
     * @returns {Promise<void>} Resolves when the flush is committed and the event is logged.
     */
    commitFlush(): Promise<void>;
    /**
     * Signals the agent (via swarm’s ClientAgent) to stop the execution of subsequent tools, logging via BusService.
     * Supports ToolSchemaService by interrupting tool call chains, enhancing session control.
     * @returns {Promise<void>} Resolves when the stop signal is committed and the event is logged.
     */
    commitStopTools(): Promise<void>;
    /**
     * Commits a system message to the agent’s history via the swarm’s agent (ClientAgent), logging via BusService.
     * Supports system-level updates within the session, coordinated with ClientHistory.
     * @param {string} message - The system message to commit, typically for configuration or context.
     * @returns {Promise<void>} Resolves when the message is committed and the event is logged.
     */
    commitSystemMessage(message: string): Promise<void>;
    /**
     * Commits an assistant message to the agent’s history via the swarm’s agent (ClientAgent) without triggering execution.
     * Logs the action via BusService, supporting ClientHistory for assistant response logging.
     * @param {string} message - The assistant message to commit, typically an agent response.
     * @returns {Promise<void>} Resolves when the message is committed and the event is logged.
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Connects the session to a message connector, subscribing to emitted messages and returning a receiver function.
     * Links _emitSubject to the connector for outgoing messages and processes incoming messages via execute, supporting real-time interaction.
     * Integrates with SessionConnectionService for session lifecycle and SwarmConnectionService for agent metadata.
     * @param {SendMessageFn} connector - The function to handle outgoing messages, receiving data, agentName, and clientId.
     * @returns {ReceiveMessageFn<string>} A function to receive incoming messages (IIncomingMessage) and return processed output.
     */
    connect(connector: SendMessageFn): ReceiveMessageFn<string>;
    /**
     * Disposes of the session, performing cleanup and invoking the onDispose callback if provided.
     * Called when the session is no longer needed, ensuring proper resource release with SessionConnectionService.
     * @returns {Promise<void>} Resolves when disposal is complete and logged.
     */
    dispose(): Promise<void>;
}

/**
 * Service class for managing session connections and operations in the swarm system.
 * Implements ISession to provide an interface for session instance management, messaging, execution, and lifecycle operations, scoped to clientId and swarmName.
 * Integrates with ClientAgent (agent execution within sessions), SessionPublicService (public session API), SwarmPublicService (swarm-level operations), PolicyPublicService (policy enforcement), AgentConnectionService (agent integration), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientSession instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with SwarmConnectionService for swarm access, PolicyConnectionService for policy enforcement, and SwarmSchemaService for swarm configuration.
 * @implements {ISession}
 */
declare class SessionConnectionService implements ISession {
    /**
     * Logger service instance, injected via DI, for logging session operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Bus service instance, injected via DI, for emitting session-related events.
     * Passed to ClientSession for event propagation (e.g., execution events), aligning with BusService’s event system in AgentConnectionService.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Method context service instance, injected via DI, for accessing execution context.
     * Used to retrieve clientId and swarmName in method calls, integrating with MethodContextService’s scoping in SessionPublicService.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * Swarm connection service instance, injected via DI, for managing swarm instances.
     * Provides swarm access to ClientSession in getSession, supporting SwarmPublicService’s swarm-level operations.
     * @type {SwarmConnectionService}
     * @private
     */
    private readonly swarmConnectionService;
    /**
     * Policy connection service instance, injected via DI, for managing policy instances.
     * Provides policy enforcement to ClientSession in getSession, integrating with PolicyPublicService and PolicyConnectionService.
     * @type {PolicyConnectionService}
     * @private
     */
    private readonly policyConnectionService;
    /**
     * Swarm schema service instance, injected via DI, for retrieving swarm configurations.
     * Provides callbacks and policies to ClientSession in getSession, aligning with SwarmMetaService’s schema management.
     * @type {SwarmSchemaService}
     * @private
     */
    private readonly swarmSchemaService;
    /**
     * Retrieves or creates a memoized ClientSession instance for a given client and swarm.
     * Uses functools-kit’s memoize to cache instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
     * Configures the session with swarm data from SwarmSchemaService, policies from PolicyConnectionService (merged via MergePolicy or defaulting to NoopPolicy), and swarm access from SwarmConnectionService.
     * Supports ClientAgent (session context for execution), SessionPublicService (public API), and SwarmPublicService (swarm integration).
     * @param {string} clientId - The client ID, scoping the session to a specific client, tied to Session.interface and PerfService tracking.
     * @param {string} swarmName - The name of the swarm, scoping the session to a specific swarm, sourced from Swarm.interface.
     * @returns {ClientSession} The memoized ClientSession instance configured for the client and swarm.
     */
    getSession: ((clientId: string, swarmName: string) => ClientSession) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientSession>;
    /**
     * Emits a message to the session, typically for asynchronous communication.
     * Delegates to ClientSession.emit, using context from MethodContextService to identify the session, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s emit, supporting ClientAgent’s output handling and SwarmPublicService’s messaging.
     * @param {string} content - The content to emit to the session.
     * @returns {Promise<void>} A promise resolving when the message is emitted.
     */
    emit: (content: string) => Promise<void>;
    /**
     * Executes a command in the session with a specified execution mode.
     * Delegates to ClientSession.execute, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s execute, supporting ClientAgent’s EXECUTE_FN within a session context and PerfService tracking.
     * @param {string} content - The content to execute.
     * @param {ExecutionMode} mode - The execution mode (e.g., stateless, stateful), sourced from Session.interface.
     * @returns {Promise<string>} A promise resolving to the execution result as a string.
     */
    execute: (content: string, mode: ExecutionMode) => Promise<string>;
    /**
     * Runs a stateless completion in the session with the given content.
     * Delegates to ClientSession.run, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s run, supporting ClientAgent’s RUN_FN within a session context.
     * @param {string} content - The content to run.
     * @returns {Promise<string>} A promise resolving to the completion result as a string.
     */
    run: (content: string) => Promise<string>;
    /**
     * Connects to the session using a provided send message function, returning a receive message function.
     * Delegates to ClientSession.connect, explicitly passing clientId and swarmName, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s connect, supporting ClientAgent’s bidirectional communication and SwarmPublicService’s swarm interactions.
     * @param {SendMessageFn} connector - The function to send messages to the session.
     * @param {string} clientId - The client ID, scoping the connection to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, scoping the connection to a specific swarm.
     * @returns {ReceiveMessageFn<string>} A function to receive messages from the session, returning strings.
     */
    connect: (connector: SendMessageFn, clientId: string, swarmName: SwarmName) => ReceiveMessageFn<string>;
    /**
     * Commits tool output to the session’s history, typically for OpenAI-style tool calls.
     * Delegates to ClientSession.commitToolOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitToolOutput, supporting ClientAgent’s TOOL_EXECUTOR and HistoryPublicService integration.
     * @param {string} toolId - The tool_call_id for OpenAI history integration.
     * @param {string} content - The tool output content to commit.
     * @returns {Promise<void>} A promise resolving when the tool output is committed.
     */
    commitToolOutput: (toolId: string, content: string) => Promise<void>;
    /**
     * Commits a system message to the session’s history.
     * Delegates to ClientSession.commitSystemMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitSystemMessage, supporting ClientAgent’s system updates and HistoryPublicService.
     * @param {string} message - The system message to commit.
     * @returns {Promise<void>} A promise resolving when the system message is committed.
     */
    commitSystemMessage: (message: string) => Promise<void>;
    /**
     * Commits an assistant message to the session’s history.
     * Delegates to ClientSession.commitAssistantMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitAssistantMessage, supporting ClientAgent’s assistant responses and HistoryPublicService.
     * @param {string} message - The assistant message to commit.
     * @returns {Promise<void>} A promise resolving when the assistant message is committed.
     */
    commitAssistantMessage: (message: string) => Promise<void>;
    /**
     * Commits a user message to the session’s history without triggering a response.
     * Delegates to ClientSession.commitUserMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitUserMessage, supporting ClientAgent’s user input logging and HistoryPublicService.
     * @param {string} message - The user message to commit.
     * @returns {Promise<void>} A promise resolving when the user message is committed.
     */
    commitUserMessage: (message: string, mode: ExecutionMode) => Promise<void>;
    /**
     * Commits a flush of the session’s history, clearing stored data.
     * Delegates to ClientSession.commitFlush, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitFlush, supporting ClientAgent’s history reset and HistoryPublicService.
     * @returns {Promise<void>} A promise resolving when the session history is flushed.
     */
    commitFlush: () => Promise<void>;
    /**
     * Prevents the next tool from being executed in the session’s workflow.
     * Delegates to ClientSession.commitStopTools, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SessionPublicService’s commitStopTools, supporting ClientAgent’s TOOL_EXECUTOR interruption.
     * @returns {Promise<void>} A promise resolving when tool execution is stopped.
     */
    commitStopTools: () => Promise<void>;
    /**
     * Disposes of the session connection, cleaning up resources and clearing the memoized instance.
     * Checks if the session exists in the memoization cache before calling ClientSession.dispose, then clears the cache.
     * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with SessionPublicService’s dispose and PerfService’s cleanup.
     * @returns {Promise<void>} A promise resolving when the session connection is disposed.
     */
    dispose: () => Promise<void>;
}

/**
 * Interface extending AgentConnectionService for type definition purposes.
 * Used to define TAgentConnectionService by excluding internal keys, ensuring AgentPublicService aligns with public-facing operations.
 * @interface IAgentConnectionService
 */
interface IAgentConnectionService extends AgentConnectionService {
}
/**
 * Type representing keys to exclude from IAgentConnectionService (internal methods).
 * Used to filter out non-public methods like getAgent in TAgentConnectionService.
 * @typedef {keyof { getAgent: never }} InternalKeys
 */
type InternalKeys$8 = keyof {
    getAgent: never;
};
/**
 * Type representing the public interface of AgentPublicService, derived from IAgentConnectionService.
 * Excludes internal methods (e.g., getAgent) via InternalKeys, ensuring a consistent public API for agent operations.
 * @typedef {Object} TAgentConnectionService
 */
type TAgentConnectionService = {
    [key in Exclude<keyof IAgentConnectionService, InternalKeys$8>]: unknown;
};
/**
 * Service class for managing public agent operations in the swarm system.
 * Implements TAgentConnectionService to provide a public API for agent interactions, delegating to AgentConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., EXECUTE_FN, RUN_FN execution), PerfService (e.g., execution tracking via execute), DocService (e.g., agent documentation via agentName), and BusService (e.g., execution events via clientId).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like agent creation, execution, message commits, and disposal.
 */
declare class AgentPublicService implements TAgentConnectionService {
    /**
     * Logger service instance, injected via DI, for logging agent operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with DocService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Agent connection service instance, injected via DI, for underlying agent operations.
     * Provides core functionality (e.g., getAgent, execute) called by public methods, aligning with ClientAgent’s execution model.
     * @type {AgentConnectionService}
     * @private
     */
    private readonly agentConnectionService;
    /**
     * Creates a reference to an agent for a specific client and method context.
     * Wraps AgentConnectionService.getAgent with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., to initialize agent refs) and PerfService (e.g., to track agent usage via clientId).
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking.
     * @param {AgentName} agentName - The name of the agent, sourced from Agent.interface, used in DocService docs.
     * @returns {Promise<unknown>} A promise resolving to the agent reference object.
     */
    createAgentRef: (methodName: string, clientId: string, agentName: AgentName) => Promise<ClientAgent>;
    /**
     * Executes a command on the agent with a specified execution mode.
     * Wraps AgentConnectionService.execute with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors ClientAgent’s EXECUTE_FN, triggering BusService events (e.g., commitExecutionBegin) and PerfService tracking (e.g., startExecution).
     * @param {string} input - The command input to execute, passed to the agent.
     * @param {ExecutionMode} mode - The execution mode (e.g., stateless, stateful), sourced from Session.interface.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the execution result.
     */
    execute: (input: string, mode: ExecutionMode, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Runs a stateless completion on the agent with the given input.
     * Wraps AgentConnectionService.run with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors ClientAgent’s RUN_FN, used for quick completions without state persistence, tracked by PerfService.
     * @param {string} input - The command input to run, passed to the agent.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the completion result.
     */
    run: (input: string, methodName: string, clientId: string, agentName: AgentName) => Promise<string>;
    /**
     * Waits for the agent’s output after an operation.
     * Wraps AgentConnectionService.waitForOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., post-execution output retrieval), complementing execute and run.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the agent’s output.
     */
    waitForOutput: (methodName: string, clientId: string, agentName: AgentName) => Promise<string>;
    /**
     * Commits tool output to the agent’s history, typically for OpenAI-style tool calls.
     * Wraps AgentConnectionService.commitToolOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent’s tool execution (e.g., TOOL_EXECUTOR), documented in DocService (e.g., tool schemas).
     * @param {string} toolId - The tool_call_id for OpenAI history integration.
     * @param {string} content - The tool output content to commit.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the commit result.
     */
    commitToolOutput: (toolId: string, content: string, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits a system message to the agent’s history.
     * Wraps AgentConnectionService.commitSystemMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., system prompt updates), documented in DocService (e.g., system prompts).
     * @param {string} message - The system message to commit.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the commit result.
     */
    commitSystemMessage: (message: string, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits an assistant message to the agent’s history.
     * Wraps AgentConnectionService.commitAssistantMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent’s assistant responses, tracked by PerfService and documented in DocService.
     * @param {string} message - The assistant message to commit.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the commit result.
     */
    commitAssistantMessage: (message: string, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits a user message to the agent’s history without triggering an answer.
     * Wraps AgentConnectionService.commitUserMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent for user input logging, complementing execute and run.
     * @param {string} message - The user message to commit.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the commit result.
     */
    commitUserMessage: (message: string, mode: ExecutionMode, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits a flush of the agent’s history, clearing stored data.
     * Wraps AgentConnectionService.commitFlush with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent session resets, tracked by PerfService for performance cleanup.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the flush result.
     */
    commitFlush: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits a change of agent to prevent subsequent tool executions.
     * Wraps AgentConnectionService.commitAgentChange with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent to manage agent transitions, documented in DocService (e.g., agent dependencies).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the change result.
     */
    commitAgentChange: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits a stop to prevent the next tool from being executed.
     * Wraps AgentConnectionService.commitStopTools with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent’s tool execution control (e.g., TOOL_EXECUTOR interruption).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the stop result.
     */
    commitStopTools: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Disposes of the agent, cleaning up resources.
     * Wraps AgentConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Aligns with PerfService’s dispose (e.g., session cleanup) and BusService’s dispose (e.g., subscription cleanup).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<unknown>} A promise resolving to the dispose result.
     */
    dispose: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
}

/**
 * Interface extending HistoryConnectionService for type definition purposes.
 * Used to define THistoryConnectionService by excluding internal keys, ensuring HistoryPublicService aligns with public-facing operations.
 * @interface IHistoryConnectionService
 */
interface IHistoryConnectionService extends HistoryConnectionService {
}
/**
 * Type representing keys to exclude from IHistoryConnectionService (internal methods).
 * Used to filter out non-public methods like getHistory and getItems in THistoryConnectionService.
 * @typedef {keyof { getHistory: never; getItems: never }} InternalKeys
 */
type InternalKeys$7 = keyof {
    getHistory: never;
    getItems: never;
};
/**
 * Type representing the public interface of HistoryPublicService, derived from IHistoryConnectionService.
 * Excludes internal methods (e.g., getHistory, getItems) via InternalKeys, ensuring a consistent public API for history operations.
 * @typedef {Object} THistoryConnectionService
 */
type THistoryConnectionService = {
    [key in Exclude<keyof IHistoryConnectionService, InternalKeys$7>]: unknown;
};
/**
 * Service class for managing public history operations in the swarm system.
 * Implements THistoryConnectionService to provide a public API for history interactions, delegating to HistoryConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., message history in EXECUTE_FN), AgentPublicService (e.g., commitSystemMessage pushing to history), PerfService (e.g., session tracking via clientId), and DocService (e.g., history documentation).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like pushing messages, popping messages, converting history to arrays, and disposal.
 */
declare class HistoryPublicService implements THistoryConnectionService {
    /**
     * Logger service instance, injected via DI, for logging history operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentPublicService and DocService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * History connection service instance, injected via DI, for underlying history operations.
     * Provides core functionality (e.g., push, pop) called by public methods, aligning with ClientAgent’s history management.
     * @type {HistoryConnectionService}
     * @private
     */
    private readonly historyConnectionService;
    /**
     * Pushes a message to the agent’s history for a specific client and method context.
     * Wraps HistoryConnectionService.push with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in AgentPublicService (e.g., commitSystemMessage, commitUserMessage) and ClientAgent (e.g., EXECUTE_FN message logging).
     * @param {IModelMessage} message - The message object to push, sourced from ModelMessage.model (e.g., system, user, assistant messages).
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking.
     * @param {AgentName} agentName - The name of the agent, sourced from Agent.interface, used in DocService docs.
     * @returns {Promise<void>} A promise resolving when the message is pushed to history.
     */
    push: (message: IModelMessage, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Pops the most recent message from the agent’s history.
     * Wraps HistoryConnectionService.pop with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., retrieving last message in EXECUTE_FN) and AgentPublicService (e.g., history manipulation).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<IModelMessage | null>} A promise resolving to the popped message or null if the history is empty.
     */
    pop: (methodName: string, clientId: string, agentName: AgentName) => Promise<IModelMessage<object>>;
    /**
     * Converts the agent’s history to an array tailored for agent processing, incorporating a prompt.
     * Wraps HistoryConnectionService.toArrayForAgent with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., EXECUTE_FN context preparation) and DocService (e.g., history documentation with prompts).
     * @param {string} prompt - The prompt to include in the array conversion, enhancing agent context.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<any[]>} A promise resolving to an array of history items formatted for agent use.
     */
    toArrayForAgent: (prompt: string, methodName: string, clientId: string, agentName: AgentName) => Promise<IModelMessage<object>[]>;
    /**
     * Converts the agent’s history to a raw array of items.
     * Wraps HistoryConnectionService.toArrayForRaw with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., raw history access in EXECUTE_FN) and PerfService (e.g., history-based performance metrics).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<any[]>} A promise resolving to a raw array of history items.
     */
    toArrayForRaw: (methodName: string, clientId: string, agentName: AgentName) => Promise<IModelMessage<object>[]>;
    /**
     * Disposes of the agent’s history, cleaning up resources.
     * Wraps HistoryConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Aligns with AgentPublicService’s dispose (e.g., agent cleanup) and PerfService’s dispose (e.g., session cleanup).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {AgentName} agentName - The agent name for identification.
     * @returns {Promise<void>} A promise resolving when the history is disposed.
     */
    dispose: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
}

/**
 * Interface extending SessionConnectionService for type definition purposes.
 * Used to define TSessionConnectionService by excluding internal keys, ensuring SessionPublicService aligns with public-facing operations.
 * @interface ISessionConnectionService
 */
interface ISessionConnectionService extends SessionConnectionService {
}
/**
 * Type representing keys to exclude from ISessionConnectionService (internal methods).
 * Used to filter out non-public methods like getSession in TSessionConnectionService.
 * @typedef {keyof { getSession: never }} InternalKeys
 */
type InternalKeys$6 = keyof {
    getSession: never;
};
/**
 * Type representing the public interface of SessionPublicService, derived from ISessionConnectionService.
 * Excludes internal methods (e.g., getSession) via InternalKeys, ensuring a consistent public API for session operations.
 * @typedef {Object} TSessionConnectionService
 */
type TSessionConnectionService = {
    [key in Exclude<keyof ISessionConnectionService, InternalKeys$6>]: unknown;
};
/**
 * Service class for managing public session interactions in the swarm system.
 * Implements TSessionConnectionService to provide a public API for session-related operations, delegating to SessionConnectionService and wrapping calls with MethodContextService and ExecutionContextService for context scoping.
 * Integrates with ClientAgent (e.g., EXECUTE_FN, RUN_FN session execution), AgentPublicService (e.g., session-level messaging), PerfService (e.g., execution tracking in startExecution), BusService (e.g., commitExecutionBegin events), and SwarmMetaService (e.g., swarm context via swarmName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like message emission, execution, connection handling, message commits, and session disposal.
 */
declare class SessionPublicService implements TSessionConnectionService {
    /**
     * Logger service instance, injected via DI, for logging session operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO or CC_LOGGER_ENABLE_LOG is true, consistent with AgentPublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Performance service instance, injected via DI, for tracking execution metrics.
     * Used in connect to measure execution duration (startExecution, endExecution), aligning with PerfService’s sessionState tracking.
     * @type {PerfService}
     * @private
     */
    private readonly perfService;
    /**
     * Session connection service instance, injected via DI, for underlying session operations.
     * Provides core functionality (e.g., emit, execute) called by public methods, supporting ClientAgent’s session model.
     * @type {SessionConnectionService}
     * @private
     */
    private readonly sessionConnectionService;
    /**
     * Bus service instance, injected via DI, for emitting session-related events.
     * Used in connect to signal execution start and end (commitExecutionBegin, commitExecutionEnd), integrating with BusService’s event system.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Emits a message to the session for a specific client and swarm.
     * Wraps SessionConnectionService.emit with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., session-level messaging) and AgentPublicService (e.g., swarm context emission).
     * @param {string} content - The message content to emit to the session.
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking.
     * @param {SwarmName} swarmName - The swarm name, sourced from Swarm.interface, used in SwarmMetaService context.
     * @returns {Promise<void>} A promise resolving when the message is emitted.
     */
    emit: (content: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Executes a command in the session with a specified execution mode.
     * Wraps SessionConnectionService.execute with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors ClientAgent’s EXECUTE_FN at the session level, triggering BusService events and PerfService tracking.
     * @param {string} content - The command content to execute in the session.
     * @param {ExecutionMode} mode - The execution mode (e.g., stateless, stateful), sourced from Session.interface.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {Promise<void>} A promise resolving when the command is executed.
     */
    execute: (content: string, mode: ExecutionMode, methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Runs a stateless completion in the session with the given content.
     * Wraps SessionConnectionService.run with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors ClientAgent’s RUN_FN at the session level, used for quick completions without state persistence.
     * @param {string} content - The content to run in the session.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {Promise<void>} A promise resolving when the completion is run.
     */
    run: (content: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Connects to the session, establishing a messaging channel with performance tracking and event emission.
     * Uses SessionConnectionService.connect directly, wrapping execution in ExecutionContextService for detailed tracking, logging via LoggerService if enabled.
     * Integrates with ClientAgent (e.g., session-level messaging), PerfService (e.g., execution metrics), and BusService (e.g., execution events).
     * @param {SendMessageFn} connector - The function to send messages, provided by the caller (e.g., ClientAgent).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {ReceiveMessageFn<string>} A function to receive and process incoming messages, returning execution results.
     */
    connect: (connector: SendMessageFn, methodName: string, clientId: string, swarmName: SwarmName) => ReceiveMessageFn<string>;
    /**
     * Commits tool output to the session’s history, typically for OpenAI-style tool calls.
     * Wraps SessionConnectionService.commitToolOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent’s tool execution (e.g., TOOL_EXECUTOR), mirrored in AgentPublicService.
     * @param {string} toolId - The tool_call_id for OpenAI history integration.
     * @param {string} content - The tool output content to commit.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {Promise<void>} A promise resolving when the tool output is committed.
     */
    commitToolOutput: (toolId: string, content: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits a system message to the session’s history.
     * Wraps SessionConnectionService.commitSystemMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., system prompt updates), mirrored in AgentPublicService.
     * @param {string} message - The system message to commit.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {Promise<void>} A promise resolving when the system message is committed.
     */
    commitSystemMessage: (message: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits an assistant message to the session’s history.
     * Wraps SessionConnectionService.commitAssistantMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent’s assistant responses, mirrored in AgentPublicService and tracked by PerfService.
     * @param {string} message - The assistant message to commit.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {Promise<void>} A promise resolving when the assistant message is committed.
     */
    commitAssistantMessage: (message: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits a user message to the session’s history without triggering an answer.
     * Wraps SessionConnectionService.commitUserMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent for user input logging, mirrored in AgentPublicService.
     * @param {string} message - The user message to commit.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {Promise<void>} A promise resolving when the user message is committed.
     */
    commitUserMessage: (message: string, mode: ExecutionMode, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits a flush of the session’s history, clearing stored data.
     * Wraps SessionConnectionService.commitFlush with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent session resets, mirrored in AgentPublicService and tracked by PerfService.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {Promise<void>} A promise resolving when the history is flushed.
     */
    commitFlush: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits a stop to prevent the next tool from being executed in the session.
     * Wraps SessionConnectionService.commitStopTools with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent’s tool execution control (e.g., TOOL_EXECUTOR interruption), mirrored in AgentPublicService.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {Promise<void>} A promise resolving when the tool stop is committed.
     */
    commitStopTools: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Disposes of the session, cleaning up resources.
     * Wraps SessionConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Aligns with AgentPublicService’s dispose and PerfService’s session cleanup.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {SwarmName} swarmName - The swarm name for context.
     * @returns {Promise<void>} A promise resolving when the session is disposed.
     */
    dispose: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
}

/**
 * Interface extending SwarmConnectionService for type definition purposes.
 * Used to define TSwarmConnectionService by excluding internal keys, ensuring SwarmPublicService aligns with public-facing operations.
 * @interface ISwarmConnectionService
 */
interface ISwarmConnectionService extends SwarmConnectionService {
}
/**
 * Type representing keys to exclude from ISwarmConnectionService (internal methods).
 * Used to filter out non-public methods like getSwarm in TSwarmConnectionService.
 * @typedef {keyof { getSwarm: never }} InternalKeys
 */
type InternalKeys$5 = keyof {
    getSwarm: never;
};
/**
 * Type representing the public interface of SwarmPublicService, derived from ISwarmConnectionService.
 * Excludes internal methods (e.g., getSwarm) via InternalKeys, ensuring a consistent public API for swarm-level operations.
 * @typedef {Object} TSwarmConnectionService
 */
type TSwarmConnectionService = {
    [key in Exclude<keyof ISwarmConnectionService, InternalKeys$5>]: unknown;
};
/**
 * Service class for managing public swarm-level interactions in the swarm system.
 * Implements TSwarmConnectionService to provide a public API for swarm operations, delegating to SwarmConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., agent execution in EXECUTE_FN), AgentPublicService (e.g., agent-specific operations), SwarmMetaService (e.g., swarm metadata via swarmName), SessionPublicService (e.g., swarm context), and PerfService (e.g., tracking swarm interactions in sessionState).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like navigation, output control, agent management, and swarm disposal, all scoped to a client (clientId) and swarm (swarmName).
 */
declare class SwarmPublicService implements TSwarmConnectionService {
    /**
     * Logger service instance, injected via DI, for logging swarm operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Swarm connection service instance, injected via DI, for underlying swarm operations.
     * Provides core functionality (e.g., navigationPop, getAgent) called by public methods, supporting ClientAgent’s swarm-level needs.
     * @type {SwarmConnectionService}
     * @private
     */
    private readonly swarmConnectionService;
    /**
     * Emits a message to the session for a specific client and swarm.
     * Wraps SessionConnectionService.emit with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., session-level messaging) and AgentPublicService (e.g., swarm context emission).
     * @param {string} content - The message content to emit to the session.
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking.
     * @param {SwarmName} swarmName - The swarm name, sourced from Swarm.interface, used in SwarmMetaService context.
     * @returns {Promise<void>} A promise resolving when the message is emitted.
     */
    emit: (content: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Pops the navigation stack or returns the default agent for the swarm, scoped to a client.
     * Wraps SwarmConnectionService.navigationPop with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., navigating agent flow in EXECUTE_FN) and SwarmMetaService (e.g., managing swarm navigation state).
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking, scoping the operation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, sourced from Swarm.interface, used in SwarmMetaService context.
     * @returns {Promise<string>} A promise resolving to the pending agent name for navigation.
     */
    navigationPop: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Cancels the await of output in the swarm by emitting an empty string, scoped to a client.
     * Wraps SwarmConnectionService.cancelOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., interrupting EXECUTE_FN output) and SessionPublicService (e.g., output control in connect).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the operation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
     * @returns {Promise<void>} A promise resolving when the output is canceled.
     */
    cancelOutput: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Waits for output from the swarm, scoped to a client.
     * Wraps SwarmConnectionService.waitForOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., awaiting EXECUTE_FN results) and SessionPublicService (e.g., output handling in connect).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the operation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
     * @returns {Promise<void>} A promise resolving when output is received from the swarm.
     */
    waitForOutput: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Retrieves the current agent name from the swarm, scoped to a client.
     * Wraps SwarmConnectionService.getAgentName with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., identifying active agent in EXECUTE_FN) and AgentPublicService (e.g., agent context).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the operation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
     * @returns {Promise<string>} A promise resolving to the current agent name.
     */
    getAgentName: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Retrieves the current agent instance from the swarm, scoped to a client.
     * Wraps SwarmConnectionService.getAgent with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., accessing agent details in EXECUTE_FN) and AgentPublicService (e.g., agent operations).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the operation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
     * @returns {Promise<IAgent>} A promise resolving to the current agent instance, sourced from Agent.interface.
     */
    getAgent: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<IAgent>;
    /**
     * Sets an agent reference in the swarm, associating an agent instance with an agent name, scoped to a client.
     * Wraps SwarmConnectionService.setAgentRef with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., configuring agents in EXECUTE_FN) and AgentPublicService (e.g., agent management).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the operation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
     * @param {AgentName} agentName - The name of the agent to set, sourced from Agent.interface.
     * @param {IAgent} agent - The agent instance to associate, sourced from Agent.interface.
     * @returns {Promise<void>} A promise resolving when the agent reference is set.
     */
    setAgentRef: (methodName: string, clientId: string, swarmName: SwarmName, agentName: AgentName, agent: IAgent) => Promise<void>;
    /**
     * Sets the current agent name in the swarm, scoped to a client.
     * Wraps SwarmConnectionService.setAgentName with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., switching agents in EXECUTE_FN) and AgentPublicService (e.g., agent context updates).
     * @param {AgentName} agentName - The name of the agent to set, sourced from Agent.interface.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the operation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
     * @returns {Promise<void>} A promise resolving when the agent name is set.
     */
    setAgentName: (agentName: AgentName, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Disposes of the swarm, cleaning up resources, scoped to a client.
     * Wraps SwarmConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN), SessionPublicService’s dispose, and PerfService’s resource management.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the operation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
     * @returns {Promise<void>} A promise resolving when the swarm is disposed.
     */
    dispose: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
}

/**
 * Service for validating agents within the swarm system, managing agent schemas and dependencies.
 * Provides methods to register agents, validate their configurations, and query associated resources (storages, states, dependencies).
 * Integrates with AgentSchemaService (agent schema validation), SwarmSchemaService (swarm-level agent management),
 * ToolValidationService (tool validation), CompletionValidationService (completion validation),
 * StorageValidationService (storage validation), and LoggerService (logging).
 * Uses dependency injection for service dependencies and memoization for efficient validation checks.
 */
declare class AgentValidationService {
    /**
     * Logger service instance for logging validation operations and errors.
     * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Tool validation service instance for validating tools associated with agents.
     * Injected via DI, used in validate method to check agent tools.
     * @type {ToolValidationService}
     * @private
     * @readonly
     */
    private readonly toolValidationService;
    /**
     * Completion validation service instance for validating completion configurations of agents.
     * Injected via DI, used in validate method to check agent completion.
     * @type {CompletionValidationService}
     * @private
     * @readonly
     */
    private readonly completionValidationService;
    /**
     * Storage validation service instance for validating storages associated with agents.
     * Injected via DI, used in validate method to check agent storages.
     * @type {StorageValidationService}
     * @private
     * @readonly
     */
    private readonly storageValidationService;
    /**
     * Map of agent names to their schemas, used for validation and resource queries.
     * Populated by addAgent, queried by validate, getStorageList, getStateList, etc.
     * @type {Map<AgentName, IAgentSchema>}
     * @private
     */
    private _agentMap;
    /**
     * Map of agent names to their dependency lists, tracking inter-agent dependencies.
     * Populated by addAgent when dependsOn is present, queried by hasDependency.
     * @type {Map<AgentName, AgentName[]>}
     * @private
     */
    private _agentDepsMap;
    /**
     * Retrieves the list of registered agent names.
     * Logs the operation if info-level logging is enabled, supporting SwarmSchemaService’s agent enumeration.
     * @returns {AgentName[]} An array of all registered agent names from _agentMap.
     */
    getAgentList: () => AgentName[];
    /**
     * Retrieves the list of storage names associated with a given agent.
     * Logs the operation and validates agent existence, supporting ClientStorage integration.
     * @param {AgentName} agentName - The name of the agent to query, sourced from Agent.interface.
     * @returns {StorageName[]} An array of storage names from the agent’s schema.
     * @throws {Error} If the agent is not found in _agentMap.
     */
    getStorageList: (agentName: AgentName) => StorageName[];
    /**
     * Retrieves the list of state names associated with a given agent.
     * Logs the operation and validates agent existence, supporting ClientState integration.
     * @param {AgentName} agentName - The name of the agent to query, sourced from Agent.interface.
     * @returns {StateName[]} An array of state names from the agent’s schema.
     * @throws {Error} If the agent is not found in _agentMap.
     */
    getStateList: (agentName: AgentName) => StateName[];
    /**
     * Registers a new agent with its schema in the validation service.
     * Logs the operation and updates _agentMap and _agentDepsMap, supporting AgentSchemaService’s agent registration.
     * @param {AgentName} agentName - The name of the agent to add, sourced from Agent.interface.
     * @param {IAgentSchema} agentSchema - The schema defining the agent’s configuration (tools, storages, states, etc.).
     * @throws {Error} If the agent already exists in _agentMap.
     */
    addAgent: (agentName: AgentName, agentSchema: IAgentSchema) => void;
    /**
     * Checks if an agent has a registered storage, memoized for performance.
     * Logs the operation and validates agent existence, supporting ClientStorage validation.
     * @param {AgentName} agentName - The name of the agent to check, sourced from Agent.interface.
     * @param {StorageName} storageName - The name of the storage to verify, sourced from Storage.interface.
     * @returns {boolean} True if the storage is registered in the agent’s schema, false otherwise.
     * @throws {Error} If the agent is not found in _agentMap.
     */
    hasStorage: ((agentName: AgentName, storageName: StorageName) => boolean) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, boolean>;
    /**
     * Checks if an agent has a registered dependency on another agent, memoized for performance.
     * Logs the operation, supporting inter-agent dependency validation within SwarmSchemaService.
     * @param {AgentName} targetAgentName - The name of the agent to check, sourced from Agent.interface.
     * @param {AgentName} depAgentName - The name of the dependency agent to verify, sourced from Agent.interface.
     * @returns {boolean} True if the dependency is registered in the agent’s dependsOn list, false otherwise.
     */
    hasDependency: ((targetAgentName: AgentName, depAgentName: AgentName) => boolean) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, boolean>;
    /**
     * Checks if an agent has a registered state, memoized for performance.
     * Logs the operation and validates agent existence, supporting ClientState validation.
     * @param {AgentName} agentName - The name of the agent to check, sourced from Agent.interface.
     * @param {StateName} stateName - The name of the state to verify, sourced from State.interface.
     * @returns {boolean} True if the state is registered in the agent’s schema, false otherwise.
     * @throws {Error} If the agent is not found in _agentMap.
     */
    hasState: ((agentName: AgentName, stateName: StateName) => boolean) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, boolean>;
    /**
     * Validates an agent’s configuration by its name and source, memoized by agentName for performance.
     * Checks the agent’s existence, completion, tools, and storages, delegating to respective validation services.
     * Logs the operation, supporting AgentSchemaService’s validation workflow within SwarmSchemaService.
     * @param {AgentName} agentName - The name of the agent to validate, sourced from Agent.interface.
     * @param {string} source - The source of the validation request (e.g., "swarm-init"), for error context.
     * @throws {Error} If the agent is not found, or if its completion, tools, or storages are invalid.
     */
    validate: (agentName: AgentName, source: string) => void;
}

/**
 * Service for validating tool configurations within the swarm system.
 * Manages a map of registered tools, ensuring their uniqueness and existence during validation.
 * Integrates with ToolSchemaService (tool registration), AgentValidationService (validating agent tools),
 * ClientAgent (tool usage), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
 */
declare class ToolValidationService {
    /**
     * Logger service instance for logging validation operations and errors.
     * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Map of tool names to their schemas, used to track and validate tools.
     * Populated by addTool, queried by validate.
     * @type {Map<ToolName, IAgentTool>}
     * @private
     */
    private _toolMap;
    /**
     * Registers a new tool with its schema in the validation service.
     * Logs the operation and ensures uniqueness, supporting ToolSchemaService’s registration process.
     * @param {ToolName} toolName - The name of the tool to add, sourced from Agent.interface.
     * @param {IAgentTool} toolSchema - The schema defining the tool’s configuration, sourced from Agent.interface.
     * @throws {Error} If the tool name already exists in _toolMap.
     */
    addTool: (toolName: ToolName, toolSchema: IAgentTool) => void;
    /**
     * Validates if a tool name exists in the registered map, memoized by toolName for performance.
     * Logs the operation and checks existence, supporting AgentValidationService’s validation of agent tools.
     * @param {ToolName} toolName - The name of the tool to validate, sourced from Agent.interface.
     * @param {string} source - The source of the validation request (e.g., "agent-validate"), for error context.
     * @throws {Error} If the tool name is not found in _toolMap.
     */
    validate: (toolName: ToolName, source: string) => void;
}

/**
 * Service for managing and validating sessions within the swarm system.
 * Tracks session associations with swarms, modes, agents, histories, storages, and states,
 * ensuring session existence and resource usage consistency.
 * Integrates with SessionConnectionService (session management), ClientSession (session lifecycle),
 * ClientAgent (agent usage), ClientStorage (storage usage), ClientState (state usage),
 * SwarmSchemaService (swarm association), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
 */
declare class SessionValidationService {
    /**
     * Logger service instance for logging session operations and errors.
     * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Map of session IDs to their associated storage names, tracking storage usage per session.
     * Populated by addStorageUsage, modified by removeStorageUsage.
     * @type {Map<SessionId, StorageName[]>}
     * @private
     */
    private _storageSwarmMap;
    /**
     * Map of session IDs to their associated agent names for history tracking.
     * Populated by addHistoryUsage, modified by removeHistoryUsage.
     * @type {Map<SessionId, AgentName[]>}
     * @private
     */
    private _historySwarmMap;
    /**
     * Map of session IDs to their associated agent names for active usage.
     * Populated by addAgentUsage, modified by removeAgentUsage.
     * @type {Map<SessionId, AgentName[]>}
     * @private
     */
    private _agentSwarmMap;
    /**
     * Map of session IDs to their associated state names, tracking state usage per session.
     * Populated by addStateUsage, modified by removeStateUsage.
     * @type {Map<SessionId, StateName[]>}
     * @private
     */
    private _stateSwarmMap;
    /**
     * Map of session IDs to their associated swarm names, defining session-swarm relationships.
     * Populated by addSession, removed by removeSession.
     * @type {Map<SessionId, SwarmName>}
     * @private
     */
    private _sessionSwarmMap;
    /**
     * Map of session IDs to their modes, defining session behavior.
     * Populated by addSession, removed by removeSession.
     * @type {Map<SessionId, SessionMode>}
     * @private
     */
    private _sessionModeMap;
    /**
     * Registers a new session with its swarm and mode.
     * Logs the operation and ensures uniqueness, supporting SessionConnectionService’s session creation.
     * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
     * @param {SwarmName} swarmName - The name of the associated swarm, sourced from Swarm.interface.
     * @param {SessionMode} sessionMode - The mode of the session (e.g., "active", "passive"), sourced from Session.interface.
     * @throws {Error} If the session already exists in _sessionSwarmMap.
     */
    addSession: (clientId: SessionId, swarmName: SwarmName, sessionMode: SessionMode) => void;
    /**
     * Tracks an agent’s usage within a session, adding it to the session’s agent list.
     * Logs the operation, supporting ClientAgent’s session-specific activity tracking.
     * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
     * @param {AgentName} agentName - The name of the agent to add, sourced from Agent.interface.
     */
    addAgentUsage: (sessionId: SessionId, agentName: AgentName) => void;
    /**
     * Tracks an agent’s history usage within a session, adding it to the session’s history list.
     * Logs the operation, supporting ClientHistory’s session-specific history tracking.
     * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
     * @param {AgentName} agentName - The name of the agent to add, sourced from Agent.interface.
     */
    addHistoryUsage: (sessionId: SessionId, agentName: AgentName) => void;
    /**
     * Tracks a storage’s usage within a session, adding it to the session’s storage list.
     * Logs the operation, supporting ClientStorage’s session-specific storage tracking.
     * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
     * @param {StorageName} storageName - The name of the storage to add, sourced from Storage.interface.
     */
    addStorageUsage: (sessionId: SessionId, storageName: StorageName) => void;
    /**
     * Tracks a state’s usage within a session, adding it to the session’s state list.
     * Logs the operation, supporting ClientState’s session-specific state tracking.
     * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
     * @param {StateName} stateName - The name of the state to add, sourced from State.interface.
     */
    addStateUsage: (sessionId: SessionId, stateName: StateName) => void;
    /**
     * Removes an agent from a session’s agent usage list.
     * Logs the operation and cleans up if the list becomes empty, supporting ClientAgent’s session cleanup.
     * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
     * @param {AgentName} agentName - The name of the agent to remove, sourced from Agent.interface.
     * @throws {Error} If no agents are found for the session in _agentSwarmMap.
     */
    removeAgentUsage: (sessionId: SessionId, agentName: AgentName) => void;
    /**
     * Removes an agent from a session’s history usage list.
     * Logs the operation and cleans up if the list becomes empty, supporting ClientHistory’s session cleanup.
     * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
     * @param {AgentName} agentName - The name of the agent to remove, sourced from Agent.interface.
     * @throws {Error} If no agents are found for the session in _historySwarmMap.
     */
    removeHistoryUsage: (sessionId: SessionId, agentName: AgentName) => void;
    /**
     * Removes a storage from a session’s storage usage list.
     * Logs the operation and cleans up if the list becomes empty, supporting ClientStorage’s session cleanup.
     * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
     * @param {StorageName} storageName - The name of the storage to remove, sourced from Storage.interface.
     * @throws {Error} If no storages are found for the session in _storageSwarmMap.
     */
    removeStorageUsage: (sessionId: SessionId, storageName: StorageName) => void;
    /**
     * Removes a state from a session’s state usage list.
     * Logs the operation and cleans up if the list becomes empty, supporting ClientState’s session cleanup.
     * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
     * @param {StateName} stateName - The name of the state to remove, sourced from State.interface.
     * @throws {Error} If no states are found for the session in _stateSwarmMap.
     */
    removeStateUsage: (sessionId: SessionId, stateName: StateName) => void;
    /**
     * Retrieves the mode of a session.
     * Logs the operation and validates session existence, supporting ClientSession’s mode-based behavior.
     * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
     * @returns {SessionMode} The mode of the session (e.g., "active", "passive").
     * @throws {Error} If the session does not exist in _sessionModeMap.
     */
    getSessionMode: (clientId: SessionId) => SessionMode;
    /**
     * Checks if a session exists.
     * Logs the operation, supporting quick existence checks for SessionConnectionService.
     * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
     * @returns {boolean} True if the session exists in _sessionSwarmMap, false otherwise.
     */
    hasSession: (clientId: SessionId) => boolean;
    /**
     * Retrieves the list of all registered session IDs.
     * Logs the operation, supporting SessionConnectionService’s session enumeration.
     * @returns {SessionId[]} An array of all session IDs from _sessionSwarmMap.
     */
    getSessionList: () => SessionId[];
    /**
     * Retrieves the list of agents associated with a session.
     * Logs the operation, supporting ClientAgent’s session-specific agent queries.
     * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
     * @returns {AgentName[]} An array of agent names from _agentSwarmMap, or empty array if none.
     */
    getSessionAgentList: (clientId: SessionId) => AgentName[];
    /**
     * Retrieves the list of agents in a session’s history.
     * Logs the operation, supporting ClientHistory’s session-specific history queries.
     * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
     * @returns {AgentName[]} An array of agent names from _historySwarmMap, or empty array if none.
     */
    getSessionHistoryList: (clientId: SessionId) => AgentName[];
    /**
     * Retrieves the swarm name associated with a session.
     * Logs the operation and validates session existence, supporting SwarmSchemaService’s session-swarm mapping.
     * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
     * @returns {SwarmName} The name of the associated swarm from _sessionSwarmMap.
     * @throws {Error} If the session does not exist in _sessionSwarmMap.
     */
    getSwarm: (clientId: SessionId) => SwarmName;
    /**
     * Validates if a session exists, memoized by clientId for performance.
     * Logs the operation and checks existence, supporting ClientSession’s session validation needs.
     * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
     * @param {string} source - The source of the validation request (e.g., "session-init"), for error context.
     * @throws {Error} If the clientId is missing or the session does not exist in _sessionSwarmMap.
     */
    validate: ((clientId: SessionId, source: string) => void) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, void>;
    /**
     * Removes a session and its associated mode, clearing validation cache.
     * Logs the operation, supporting SessionConnectionService’s session cleanup.
     * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
     */
    removeSession: (clientId: SessionId) => void;
    /**
     * Clears the validation cache for a specific session.
     * Logs the operation, supporting resource cleanup without removing session data.
     * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
     */
    dispose: (clientId: SessionId) => void;
}

/**
 * Service for validating swarm configurations within the swarm system.
 * Manages a map of registered swarms, ensuring their uniqueness, existence, valid agent lists, default agents, and policies.
 * Integrates with SwarmSchemaService (swarm registration), ClientSwarm (swarm operations),
 * AgentValidationService (agent validation), PolicyValidationService (policy validation),
 * SessionValidationService (session-swarm mapping), and LoggerService (logging).
 * Uses dependency injection for services and memoization for efficient validation checks.
 */
declare class SwarmValidationService {
    /**
     * Logger service instance for logging validation operations and errors.
     * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Agent validation service instance for validating agents associated with swarms.
     * Injected via DI, used in validate method to check swarm.agentList.
     * @type {AgentValidationService}
     * @private
     * @readonly
     */
    private readonly agentValidationService;
    /**
     * Policy validation service instance for validating policies associated with swarms.
     * Injected via DI, used in validate method to check swarm.policies.
     * @type {PolicyValidationService}
     * @private
     * @readonly
     */
    private readonly policyValidationService;
    /**
     * Map of swarm names to their schemas, used to track and validate swarms.
     * Populated by addSwarm, queried by getAgentList, getPolicyList, and validate.
     * @type {Map<SwarmName, ISwarmSchema>}
     * @private
     */
    private _swarmMap;
    /**
     * Registers a new swarm with its schema in the validation service.
     * Logs the operation and ensures uniqueness, supporting SwarmSchemaService’s registration process.
     * @param {SwarmName} swarmName - The name of the swarm to add, sourced from Swarm.interface.
     * @param {ISwarmSchema} swarmSchema - The schema defining the swarm’s configuration (e.g., agentList, defaultAgent, policies), sourced from Swarm.interface.
     * @throws {Error} If the swarm name already exists in _swarmMap.
     */
    addSwarm: (swarmName: SwarmName, swarmSchema: ISwarmSchema) => void;
    /**
     * Retrieves the list of agent names associated with a given swarm.
     * Logs the operation and validates swarm existence, supporting ClientSwarm’s agent management.
     * @param {SwarmName} swarmName - The name of the swarm to query, sourced from Swarm.interface.
     * @returns {string[]} An array of agent names from the swarm’s schema.
     * @throws {Error} If the swarm is not found in _swarmMap.
     */
    getAgentList: (swarmName: SwarmName) => string[];
    /**
     * Retrieves the list of policy names associated with a given swarm.
     * Logs the operation and validates swarm existence, supporting ClientSwarm’s policy enforcement.
     * @param {SwarmName} swarmName - The name of the swarm to query, sourced from Swarm.interface.
     * @returns {string[]} An array of policy names from the swarm’s schema, or empty array if none.
     * @throws {Error} If the swarm is not found in _swarmMap.
     */
    getPolicyList: (swarmName: SwarmName) => string[];
    /**
     * Retrieves the list of all registered swarm names.
     * Logs the operation, supporting SwarmSchemaService’s swarm enumeration.
     * @returns {string[]} An array of all swarm names from _swarmMap.
     */
    getSwarmList: () => string[];
    /**
     * Validates a swarm by its name and source, memoized by swarmName for performance.
     * Checks swarm existence, default agent inclusion, and validates all agents and policies.
     * Logs the operation, supporting ClientSwarm’s operational integrity.
     * @param {SwarmName} swarmName - The name of the swarm to validate, sourced from Swarm.interface.
     * @param {string} source - The source of the validation request (e.g., "swarm-init"), for error context.
     * @throws {Error} If the swarm is not found, the default agent is not in the agent list, or any agent/policy validation fails.
     */
    validate: (swarmName: SwarmName, source: string) => void;
}

/**
 * Service for validating completion names within the swarm system.
 * Manages a set of registered completion names, ensuring their uniqueness and existence during validation.
 * Integrates with CompletionSchemaService (completion registration), AgentValidationService (agent completion validation),
 * ClientAgent (completion usage), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
 */
declare class CompletionValidationService {
    /**
     * Logger service instance for logging validation operations and errors.
     * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Set of registered completion names, used to track and validate completions.
     * Populated by addCompletion, queried by validate.
     * @type {Set<CompletionName>}
     * @private
     */
    private _completionSet;
    /**
     * Registers a new completion name in the validation service.
     * Logs the operation and ensures uniqueness, supporting CompletionSchemaService’s registration process.
     * @param {CompletionName} completionName - The name of the completion to add, sourced from Completion.interface.
     * @throws {Error} If the completion name already exists in _completionSet.
     */
    addCompletion: (completionName: CompletionName) => void;
    /**
     * Validates if a completion name exists in the registered set, memoized by completionName for performance.
     * Logs the operation and checks existence, supporting AgentValidationService’s validation of agent completions.
     * @param {CompletionName} completionName - The name of the completion to validate, sourced from Completion.interface.
     * @param {string} source - The source of the validation request (e.g., "agent-validate"), for error context.
     * @throws {Error} If the completion name is not found in _completionSet.
     */
    validate: (completionName: CompletionName, source: string) => void;
}

/**
 * Service class for managing embedding schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IEmbeddingSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with StorageConnectionService and SharedStorageConnectionService (embedding logic for storage operations like take), ClientAgent (potential embedding use in execution), and AgentSchemaService (embedding references in agent schemas).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining embedding logic (e.g., calculateSimilarity and createEmbedding functions) used primarily in storage similarity searches within the swarm ecosystem.
 */
declare class EmbeddingSchemaService {
    /**
     * Logger service instance, injected via DI, for logging embedding schema operations.
     * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StorageConnectionService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Registry instance for storing embedding schemas, initialized with ToolRegistry from functools-kit.
     * Maps EmbeddingName keys to IEmbeddingSchema values, providing efficient storage and retrieval, used in register and get methods.
     * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
     * @type {ToolRegistry<Record<EmbeddingName, IEmbeddingSchema>>}
     * @private
     */
    private registry;
    /**
     * Validates an embedding schema shallowly, ensuring required fields meet basic integrity constraints.
     * Checks embeddingName as a string and calculateSimilarity and createEmbedding as functions, critical for storage operations in StorageConnectionService and SharedStorageConnectionService.
     * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with storage service needs.
     * Supports storage similarity searches (e.g., take method) by ensuring embedding schema validity before registration.
     * @param {IEmbeddingSchema} embeddingSchema - The embedding schema to validate, sourced from Embedding.interface.
     * @throws {Error} If any validation check fails, with detailed messages including embeddingName.
     * @private
     */
    private validateShallow;
    /**
     * Registers a new embedding schema in the registry after validation.
     * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (embeddingName).
     * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StorageConnectionService’s embedding usage.
     * Supports storage operations (e.g., similarity-based retrieval in ClientStorage) by providing validated embedding schemas to StorageConnectionService and SharedStorageConnectionService.
     * @param {EmbeddingName} key - The name of the embedding, used as the registry key, sourced from Embedding.interface.
     * @param {IEmbeddingSchema} value - The embedding schema to register, sourced from Embedding.interface, validated before storage.
     * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
     */
    register: (key: EmbeddingName, value: IEmbeddingSchema) => void;
    /**
     * Retrieves an embedding schema from the registry by its name.
     * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports StorageConnectionService and SharedStorageConnectionService by providing embedding logic (calculateSimilarity and createEmbedding) for storage operations like take, referenced in storage schemas.
     * @param {EmbeddingName} key - The name of the embedding to retrieve, sourced from Embedding.interface.
     * @returns {IEmbeddingSchema} The embedding schema associated with the key, sourced from Embedding.interface, including calculateSimilarity and createEmbedding functions.
     * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
     */
    get: (key: EmbeddingName) => IEmbeddingSchema;
}

/**
 * Service class for managing storage schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IStorageSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with StorageConnectionService and SharedStorageConnectionService (storage configuration for ClientStorage), EmbeddingSchemaService (embedding references), AgentSchemaService (storage references in agent schemas), ClientAgent (storage usage in execution), and StoragePublicService (public storage API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining storage configurations (e.g., createIndex function, embedding reference) used by client-specific and shared storage instances within the swarm ecosystem.
 */
declare class StorageSchemaService {
    /**
     * Logger service instance, injected via DI, for logging storage schema operations.
     * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StorageConnectionService and PerfService logging patterns.
     * @type {LoggerService}
     * @readonly
     */
    readonly loggerService: LoggerService;
    /**
     * Registry instance for storing storage schemas, initialized with ToolRegistry from functools-kit.
     * Maps StorageName keys to IStorageSchema values, providing efficient storage and retrieval, used in register and get methods.
     * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
     * @type {ToolRegistry<Record<StorageName, IStorageSchema>>}
     * @private
     */
    private registry;
    /**
     * Validates a storage schema shallowly, ensuring required fields meet basic integrity constraints.
     * Checks storageName as a string, createIndex as a function (for indexing storage data), and embedding as a string (referencing an EmbeddingName from EmbeddingSchemaService).
     * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StorageConnectionService’s configuration needs.
     * Supports ClientStorage instantiation in StorageConnectionService and SharedStorageConnectionService by ensuring schema validity before registration.
     * @param {IStorageSchema} storageSchema - The storage schema to validate, sourced from Storage.interface.
     * @throws {Error} If any validation check fails, with detailed messages including storageName.
     * @private
     */
    private validateShallow;
    /**
     * Registers a new storage schema in the registry after validation.
     * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (storageName).
     * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StorageConnectionService’s storage management.
     * Supports ClientAgent execution by providing validated storage schemas to StorageConnectionService and SharedStorageConnectionService for ClientStorage configuration.
     * @param {StorageName} key - The name of the storage, used as the registry key, sourced from Storage.interface.
     * @param {IStorageSchema} value - The storage schema to register, sourced from Storage.interface, validated before storage.
     * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
     */
    register: (key: StorageName, value: IStorageSchema) => void;
    /**
     * Retrieves a storage schema from the registry by its name.
     * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports StorageConnectionService and SharedStorageConnectionService by providing storage configuration (e.g., createIndex, embedding) for ClientStorage instantiation, referenced in AgentSchemaService schemas via the storages field.
     * @param {StorageName} key - The name of the storage to retrieve, sourced from Storage.interface.
     * @returns {IStorageSchema} The storage schema associated with the key, sourced from Storage.interface, including createIndex and embedding fields.
     * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
     */
    get: (key: StorageName) => IStorageSchema;
}

/**
 * Type representing possible storage actions for ClientStorage operations.
 * Used in dispatch to determine the action type (upsert, remove, or clear).
 * @typedef {"upsert" | "remove" | "clear"} Action
 */
type Action$1 = "upsert" | "remove" | "clear";
/**
 * Type representing the payload for storage actions in ClientStorage.
 * Defines the structure for upsert and remove operations, with optional fields based on action type.
 * @template T - The type of storage data, extending IStorageData from Storage.interface.
 * @typedef {Object} Payload
 * @property {IStorageData["id"]} itemId - The ID of the item, required for remove actions.
 * @property {T} item - The item data to upsert, required for upsert actions.
 */
type Payload<T extends IStorageData = IStorageData> = {
    itemId: IStorageData["id"];
    item: T;
};
/**
 * Class managing storage operations with embedding-based search capabilities in the swarm system.
 * Implements IStorage, supporting upsert, remove, clear, and similarity-based search with queued operations and event-driven updates.
 * Integrates with StorageConnectionService (instantiation), EmbeddingSchemaService (embeddings), ClientAgent (data storage),
 * SwarmConnectionService (swarm-level storage), and BusService (event emission).
 * @template T - The type of storage data, extending IStorageData from Storage.interface.
 * @implements {IStorage<T>}
 */
declare class ClientStorage<T extends IStorageData = IStorageData> implements IStorage<T> {
    readonly params: IStorageParams<T>;
    /**
     * Internal map to store items by their IDs, used for fast retrieval and updates.
     * Populated during initialization (waitForInit) and modified by upsert, remove, and clear operations.
     * @type {Map<IStorageData["id"], T>}
     */
    _itemMap: Map<string | number, T>;
    /**
     * Constructs a ClientStorage instance with the provided parameters.
     * Invokes the onInit callback if provided and logs construction if debugging is enabled.
     * @param {IStorageParams<T>} params - The storage parameters, including clientId, storageName, createEmbedding, getData, etc.
     */
    constructor(params: IStorageParams<T>);
    /**
     * Dispatches a storage action (upsert, remove, or clear) in a queued manner, delegating to DISPATCH_FN.
     * Ensures sequential execution of storage operations, supporting thread-safe updates from ClientAgent or tools.
     * @param {Action} action - The action to perform ("upsert", "remove", or "clear").
     * @param {Partial<Payload<T>>} payload - The payload for the action (item or itemId), partial based on action type.
     * @returns {Promise<void>} Resolves when the action is queued and processed.
     */
    dispatch: (action: Action$1, payload: Partial<Payload<T>>) => Promise<void>;
    /**
     * Creates embeddings for the given item, memoized by item ID to avoid redundant calculations via CREATE_EMBEDDING_FN.
     * Caches results for efficiency, cleared on upsert/remove to ensure freshness, supporting EmbeddingSchemaService.
     * @param {T} item - The item to create embeddings for, containing data to be indexed.
     * @returns {Promise<readonly [Embeddings, string]>} A tuple of embeddings (from Embedding.interface) and index string.
     * @private
     */
    _createEmbedding: ((item: T) => Promise<readonly [Embeddings, string]>) & functools_kit.IClearableMemoize<string | number> & functools_kit.IControlMemoize<string | number, Promise<readonly [Embeddings, string]>>;
    /**
     * Waits for the initialization of the storage, loading initial data and creating embeddings via WAIT_FOR_INIT_FN.
     * Ensures initialization happens only once using singleshot, supporting StorageConnectionService’s lifecycle.
     * @returns {Promise<void>} Resolves when initialization is complete and items are loaded into _itemMap.
     */
    waitForInit: (() => Promise<void>) & functools_kit.ISingleshotClearable;
    /**
     * Retrieves a specified number of items based on similarity to a search string, using embeddings and SortedArray.
     * Executes similarity calculations concurrently via execpool, respecting GLOBAL_CONFIG.CC_STORAGE_SEARCH_POOL, and filters by score.
     * Emits an event via BusService, supporting ClientAgent’s search-driven tool execution.
     * @param {string} search - The search string to compare against stored items.
     * @param {number} total - The maximum number of items to return.
     * @param {number} [score=GLOBAL_CONFIG.CC_STORAGE_SEARCH_SIMILARITY] - The minimum similarity score (default from global config).
     * @returns {Promise<T[]>} An array of items sorted by similarity, limited to total and score threshold.
     */
    take(search: string, total: number, score?: number): Promise<T[]>;
    /**
     * Upserts an item into the storage via the dispatch queue, delegating to UPSERT_FN.
     * Schedules the operation for sequential execution, supporting ClientAgent’s data persistence needs.
     * @param {T} item - The item to upsert, containing the data and ID.
     * @returns {Promise<void>} Resolves when the upsert operation is queued and processed.
     */
    upsert(item: T): Promise<void>;
    /**
     * Removes an item from the storage by its ID via the dispatch queue, delegating to REMOVE_FN.
     * Schedules the operation for sequential execution, supporting ClientAgent’s data management.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove, sourced from Storage.interface.
     * @returns {Promise<void>} Resolves when the remove operation is queued and processed.
     */
    remove(itemId: IStorageData["id"]): Promise<void>;
    /**
     * Clears all items from the storage via the dispatch queue, delegating to CLEAR_FN.
     * Schedules the operation for sequential execution, supporting storage reset operations.
     * @returns {Promise<void>} Resolves when the clear operation is queued and processed.
     */
    clear(): Promise<void>;
    /**
     * Retrieves an item from the storage by its ID directly from _itemMap.
     * Emits an event via BusService with the result, supporting quick lookups by ClientAgent or tools.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve, sourced from Storage.interface.
     * @returns {Promise<T | null>} The item if found in _itemMap, or null if not found.
     */
    get(itemId: IStorageData["id"]): Promise<T | null>;
    /**
     * Lists all items in the storage from _itemMap, optionally filtered by a predicate.
     * Emits an event via BusService with the filtered result if a filter is provided, supporting ClientAgent’s data enumeration.
     * @param {(item: T) => boolean} [filter] - An optional predicate to filter items; if omitted, returns all items.
     * @returns {Promise<T[]>} An array of items, filtered if a predicate is provided.
     */
    list(filter?: (item: T) => boolean): Promise<T[]>;
    /**
     * Disposes of the storage instance, invoking the onDispose callback if provided and logging via BusService.
     * Ensures proper cleanup with StorageConnectionService when the storage is no longer needed.
     * @returns {Promise<void>} Resolves when disposal is complete and logged.
     */
    dispose(): Promise<void>;
}

/**
 * Service class for managing storage connections and operations in the swarm system.
 * Implements IStorage to provide an interface for storage instance management, data manipulation, and lifecycle operations, scoped to clientId and storageName.
 * Handles both client-specific storage and delegates to SharedStorageConnectionService for shared storage, tracked via a _sharedStorageSet.
 * Integrates with ClientAgent (storage in agent execution), StoragePublicService (public storage API), SharedStorageConnectionService (shared storage delegation), AgentConnectionService (storage initialization), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientStorage instances by a composite key (clientId-storageName), ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StorageSchemaService for storage configuration, EmbeddingSchemaService for embedding functionality, SessionValidationService for usage tracking, and SharedStorageConnectionService for shared storage handling.
 * @implements {IStorage}
 */
declare class StorageConnectionService implements IStorage {
    /**
     * Logger service instance, injected via DI, for logging storage operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StoragePublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Bus service instance, injected via DI, for emitting storage-related events.
     * Passed to ClientStorage for event propagation (e.g., storage updates), aligning with BusService’s event system in AgentConnectionService.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Method context service instance, injected via DI, for accessing execution context.
     * Used to retrieve clientId and storageName in method calls, integrating with MethodContextService’s scoping in StoragePublicService.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * Storage schema service instance, injected via DI, for retrieving storage configurations.
     * Provides configuration (e.g., persist, getData, embedding) to ClientStorage in getStorage, aligning with AgentMetaService’s schema management.
     * @type {StorageSchemaService}
     * @private
     */
    private readonly storageSchemaService;
    /**
     * Session validation service instance, injected via DI, for tracking storage usage.
     * Used in getStorage and dispose to manage storage lifecycle, supporting SessionPublicService’s validation needs.
     * @type {SessionValidationService}
     * @private
     */
    private readonly sessionValidationService;
    /**
     * Embedding schema service instance, injected via DI, for retrieving embedding configurations.
     * Provides embedding logic (e.g., calculateSimilarity, createEmbedding) to ClientStorage in getStorage, supporting similarity-based retrieval in take.
     * @type {EmbeddingSchemaService}
     * @private
     */
    private readonly embeddingSchemaService;
    /**
     * Shared storage connection service instance, injected via DI, for delegating shared storage operations.
     * Used in getStorage to retrieve shared storage instances, integrating with SharedStorageConnectionService’s global storage management.
     * @type {SharedStorageConnectionService}
     * @private
     */
    private readonly sharedStorageConnectionService;
    /**
     * Set of storage names marked as shared, used to track delegation to SharedStorageConnectionService.
     * Populated in getStorage and checked in dispose to avoid disposing shared storage.
     * @type {Set<StorageName>}
     * @private
     */
    private _sharedStorageSet;
    /**
     * Retrieves or creates a memoized ClientStorage instance for a given client and storage name.
     * Uses functools-kit’s memoize to cache instances by a composite key (clientId-storageName), ensuring efficient reuse across calls.
     * Configures client-specific storage with schema data from StorageSchemaService, embedding logic from EmbeddingSchemaService, and persistence via PersistStorageAdapter or defaults from GLOBAL_CONFIG.
     * Delegates to SharedStorageConnectionService for shared storage (shared=true), tracking them in _sharedStorageSet.
     * Supports ClientAgent (storage in EXECUTE_FN), AgentConnectionService (storage initialization), and StoragePublicService (public API).
     * @param {string} clientId - The client ID, scoping the storage to a specific client, tied to Session.interface and PerfService tracking.
     * @param {StorageName} storageName - The name of the storage, sourced from Storage.interface, used in StorageSchemaService lookups.
     * @returns {ClientStorage} The memoized ClientStorage instance, either client-specific or shared via SharedStorageConnectionService.
     */
    getStorage: ((clientId: string, storageName: StorageName) => ClientStorage<any>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientStorage<any>>;
    /**
     * Retrieves a list of storage data items based on a search query, total count, and optional similarity score.
     * Delegates to ClientStorage.take after awaiting initialization, using context from MethodContextService to identify the storage, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors StoragePublicService’s take, supporting ClientAgent’s similarity-based data retrieval with embedding support from EmbeddingSchemaService.
     * @param {string} search - The search query to filter storage items.
     * @param {number} total - The maximum number of items to retrieve.
     * @param {number} [score] - The optional similarity score threshold for filtering.
     * @returns {Promise<IStorageData[]>} A promise resolving to an array of storage data items matching the query.
     */
    take: (search: string, total: number, score?: number) => Promise<IStorageData[]>;
    /**
     * Upserts an item into the storage, inserting or updating based on its ID.
     * Delegates to ClientStorage.upsert after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors StoragePublicService’s upsert, supporting ClientAgent’s data persistence.
     * @param {IStorageData} item - The item to upsert, sourced from Storage.interface, containing id and data.
     * @returns {Promise<void>} A promise resolving when the item is upserted.
     */
    upsert: (item: IStorageData) => Promise<void>;
    /**
     * Removes an item from the storage by its ID.
     * Delegates to ClientStorage.remove after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors StoragePublicService’s remove, supporting ClientAgent’s data deletion.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove, sourced from Storage.interface.
     * @returns {Promise<void>} A promise resolving when the item is removed.
     */
    remove: (itemId: IStorageData["id"]) => Promise<void>;
    /**
     * Retrieves an item from the storage by its ID.
     * Delegates to ClientStorage.get after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors StoragePublicService’s get, supporting ClientAgent’s data access, returning null if the item is not found.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve, sourced from Storage.interface.
     * @returns {Promise<IStorageData | null>} A promise resolving to the retrieved item or null if not found.
     */
    get: (itemId: IStorageData["id"]) => Promise<IStorageData | null>;
    /**
     * Retrieves a list of items from the storage, optionally filtered by a predicate function.
     * Delegates to ClientStorage.list after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors StoragePublicService’s list, supporting ClientAgent’s bulk data access.
     * @param {(item: IStorageData) => boolean} [filter] - The optional filter function to apply to the storage items.
     * @returns {Promise<IStorageData[]>} A promise resolving to an array of storage data items, filtered if a predicate is provided.
     */
    list: (filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>;
    /**
     * Clears all items from the storage, resetting it to its default state.
     * Delegates to ClientStorage.clear after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors StoragePublicService’s clear, supporting ClientAgent’s storage reset.
     * @returns {Promise<void>} A promise resolving when the storage is cleared.
     */
    clear: () => Promise<void>;
    /**
     * Disposes of the storage connection, cleaning up resources and clearing the memoized instance for client-specific storage.
     * Checks if the storage exists in the memoization cache and is not shared (via _sharedStorageSet) before calling ClientStorage.dispose, then clears the cache and updates SessionValidationService.
     * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with StoragePublicService’s dispose and PerfService’s cleanup.
     * Shared storage is not disposed here, as it is managed by SharedStorageConnectionService.
     * @returns {Promise<void>} A promise resolving when the storage connection is disposed (for client-specific storage).
     */
    dispose: () => Promise<void>;
}

/**
 * Interface extending StorageConnectionService for type definition purposes.
 * Used to define TStorageConnectionService by excluding internal keys, ensuring StoragePublicService aligns with public-facing operations.
 * @interface IStorageConnectionService
 */
interface IStorageConnectionService extends StorageConnectionService {
}
/**
 * Type representing keys to exclude from IStorageConnectionService (internal methods).
 * Used to filter out non-public methods like getStorage and getSharedStorage in TStorageConnectionService.
 * @typedef {keyof { getStorage: never; getSharedStorage: never }} InternalKeys
 */
type InternalKeys$4 = keyof {
    getStorage: never;
    getSharedStorage: never;
};
/**
 * Type representing the public interface of StoragePublicService, derived from IStorageConnectionService.
 * Excludes internal methods (e.g., getStorage, getSharedStorage) via InternalKeys, ensuring a consistent public API for client-specific storage operations.
 * @typedef {Object} TStorageConnectionService
 */
type TStorageConnectionService = {
    [key in Exclude<keyof IStorageConnectionService, InternalKeys$4>]: unknown;
};
/**
 * Service class for managing public client-specific storage operations in the swarm system.
 * Implements TStorageConnectionService to provide a public API for storage interactions, delegating to StorageConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., storing/retrieving client-specific data in EXECUTE_FN), PerfService (e.g., tracking storage usage in sessionState per clientId), and DocService (e.g., documenting storage schemas via storageName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like retrieving, upserting, removing, listing, clearing, and disposing client-specific storage.
 * Contrasts with SharedStoragePublicService (system-wide storage) by scoping storage to individual clients via clientId.
 */
declare class StoragePublicService implements TStorageConnectionService {
    /**
     * Logger service instance, injected via DI, for logging storage operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StatePublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Storage connection service instance, injected via DI, for underlying storage operations.
     * Provides core functionality (e.g., take, upsert) called by public methods, supporting ClientAgent’s client-specific storage needs.
     * @type {StorageConnectionService}
     * @private
     */
    private readonly storageConnectionService;
    /**
     * Retrieves a list of storage items based on a search query, total count, and optional score, from a client-specific storage identified by storageName and clientId.
     * Wraps StorageConnectionService.take with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., searching client-specific storage in EXECUTE_FN) and DocService (e.g., documenting searchable storage data per client).
     * @param {string} search - The search query to filter storage items.
     * @param {number} total - The maximum number of items to retrieve.
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking, scoping the storage to a specific client.
     * @param {StorageName} storageName - The name of the storage, sourced from Storage.interface, used in DocService documentation.
     * @param {number} [score] - An optional score for ranking or filtering items (e.g., relevance score).
     * @returns {Promise<IStorageData[]>} A promise resolving to an array of storage items matching the query.
     */
    take: (search: string, total: number, methodName: string, clientId: string, storageName: StorageName, score?: number) => Promise<IStorageData[]>;
    /**
     * Upserts (inserts or updates) an item in the client-specific storage identified by storageName and clientId.
     * Wraps StorageConnectionService.upsert with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., storing client-specific data in EXECUTE_FN) and PerfService (e.g., tracking storage updates in sessionState per client).
     * @param {IStorageData} item - The storage item to upsert, sourced from Storage.interface (e.g., with id, data fields).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the storage operation to a specific client.
     * @param {StorageName} storageName - The name of the storage, used in DocService documentation.
     * @returns {Promise<void>} A promise resolving when the item is upserted.
     */
    upsert: (item: IStorageData, methodName: string, clientId: string, storageName: StorageName) => Promise<void>;
    /**
     * Removes an item from the client-specific storage identified by storageName and clientId, using the item’s ID.
     * Wraps StorageConnectionService.remove with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., deleting client-specific data in EXECUTE_FN) and PerfService (e.g., tracking storage cleanup per client).
     * @param {IStorageData["id"]} itemId - The ID of the item to remove, sourced from Storage.interface.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the storage operation to a specific client.
     * @param {StorageName} storageName - The name of the storage, used in DocService documentation.
     * @returns {Promise<void>} A promise resolving when the item is removed.
     */
    remove: (itemId: IStorageData["id"], methodName: string, clientId: string, storageName: StorageName) => Promise<void>;
    /**
     * Retrieves a specific item from the client-specific storage identified by storageName and clientId, using the item’s ID.
     * Wraps StorageConnectionService.get with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., fetching client-specific data in EXECUTE_FN) and PerfService (e.g., reading storage for metrics per client).
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve, sourced from Storage.interface.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the storage operation to a specific client.
     * @param {StorageName} storageName - The name of the storage, used in DocService documentation.
     * @returns {Promise<IStorageData | null>} A promise resolving to the retrieved item or null if not found.
     */
    get: (itemId: IStorageData["id"], methodName: string, clientId: string, storageName: StorageName) => Promise<IStorageData | null>;
    /**
     * Retrieves a list of all items from the client-specific storage identified by storageName and clientId, optionally filtered by a predicate function.
     * Wraps StorageConnectionService.list with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., listing client-specific storage in EXECUTE_FN) and DocService (e.g., documenting storage contents per client).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the storage operation to a specific client.
     * @param {StorageName} storageName - The name of the storage, used in DocService documentation.
     * @param {(item: IStorageData) => boolean} [filter] - An optional predicate function to filter items.
     * @returns {Promise<IStorageData[]>} A promise resolving to an array of storage items.
     */
    list: (methodName: string, clientId: string, storageName: StorageName, filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>;
    /**
     * Clears all items from the client-specific storage identified by storageName and clientId.
     * Wraps StorageConnectionService.clear with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., resetting client-specific storage in EXECUTE_FN) and PerfService (e.g., clearing storage for performance resets per client).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the storage operation to a specific client.
     * @param {StorageName} storageName - The name of the storage, used in DocService documentation.
     * @returns {Promise<void>} A promise resolving when the storage is cleared.
     */
    clear: (methodName: string, clientId: string, storageName: StorageName) => Promise<void>;
    /**
     * Disposes of the client-specific storage identified by storageName and clientId, cleaning up resources.
     * Wraps StorageConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN) and PerfService’s dispose (e.g., clearing client-specific storage).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the storage disposal to a specific client.
     * @param {StorageName} storageName - The name of the storage, used in DocService documentation.
     * @returns {Promise<void>} A promise resolving when the storage is disposed.
     */
    dispose: (methodName: string, clientId: string, storageName: StorageName) => Promise<void>;
}

/**
 * Service for validating storage configurations within the swarm system.
 * Manages a map of registered storages, ensuring their uniqueness, existence, and valid embedding configurations.
 * Integrates with StorageSchemaService (storage registration), ClientStorage (storage operations),
 * AgentValidationService (validating agent storages), EmbeddingValidationService (embedding validation),
 * and LoggerService (logging).
 * Uses dependency injection for services and memoization for efficient validation checks.
 */
declare class StorageValidationService {
    /**
     * Logger service instance for logging validation operations and errors.
     * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Embedding validation service instance for validating embeddings associated with storages.
     * Injected via DI, used in validate method to check storage.embedding.
     * @type {EmbeddingValidationService}
     * @private
     * @readonly
     */
    private readonly embeddingValidationService;
    /**
     * Map of storage names to their schemas, used to track and validate storages.
     * Populated by addStorage, queried by validate.
     * @type {Map<StorageName, IStorageSchema>}
     * @private
     */
    private _storageMap;
    /**
     * Registers a new storage with its schema in the validation service.
     * Logs the operation and ensures uniqueness, supporting StorageSchemaService’s registration process.
     * @param {StorageName} storageName - The name of the storage to add, sourced from Storage.interface.
     * @param {IStorageSchema} storageSchema - The schema defining the storage’s configuration (e.g., embedding), sourced from Storage.interface.
     * @throws {Error} If the storage name already exists in _storageMap.
     */
    addStorage: (storageName: StorageName, storageSchema: IStorageSchema) => void;
    /**
     * Validates a storage by its name and source, memoized by storageName for performance.
     * Checks storage existence and validates its embedding, supporting ClientStorage’s operational integrity.
     * @param {StorageName} storageName - The name of the storage to validate, sourced from Storage.interface.
     * @param {string} source - The source of the validation request (e.g., "agent-validate"), for error context.
     * @throws {Error} If the storage is not found in _storageMap or its embedding is invalid.
     */
    validate: (storageName: StorageName, source: string) => void;
}

/**
 * Service for validating embedding names within the swarm system.
 * Manages a map of registered embeddings, ensuring their uniqueness and existence during validation.
 * Integrates with EmbeddingSchemaService (embedding registration), ClientStorage (embedding usage in similarity search),
 * AgentValidationService (potential embedding validation for agents), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
 */
declare class EmbeddingValidationService {
    /**
     * Logger service instance for logging validation operations and errors.
     * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Map of embedding names to their schemas, used to track and validate embeddings.
     * Populated by addEmbedding, queried by validate.
     * @type {Map<EmbeddingName, IEmbeddingSchema>}
     * @private
     */
    private _embeddingMap;
    /**
     * Registers a new embedding with its schema in the validation service.
     * Logs the operation and ensures uniqueness, supporting EmbeddingSchemaService’s registration process.
     * @param {EmbeddingName} embeddingName - The name of the embedding to add, sourced from Embedding.interface.
     * @param {IEmbeddingSchema} embeddingSchema - The schema defining the embedding’s configuration, sourced from Embedding.interface.
     * @throws {Error} If the embedding name already exists in _embeddingMap.
     */
    addEmbedding: (embeddingName: EmbeddingName, embeddingSchema: IEmbeddingSchema) => void;
    /**
     * Validates if an embedding name exists in the registered map, memoized by embeddingName for performance.
     * Logs the operation and checks existence, supporting ClientStorage’s embedding-based search validation.
     * @param {EmbeddingName} embeddingName - The name of the embedding to validate, sourced from Embedding.interface.
     * @param {string} source - The source of the validation request (e.g., "storage-validate"), for error context.
     * @throws {Error} If the embedding name is not found in _embeddingMap.
     */
    validate: (embeddingName: EmbeddingName, source: string) => void;
}

/**
 * Type representing a dispatch function for updating the state in ClientState.
 * Takes the previous state and returns a promise resolving to the updated state.
 * @template State - The type of the state data, extending IStateData from State.interface.
 * @typedef {(prevState: State) => Promise<State>} DispatchFn
 */
type DispatchFn<State extends IStateData = IStateData> = (prevState: State) => Promise<State>;
/**
 * Type representing possible actions for ClientState operations.
 * Used in dispatch to determine whether to read or write the state.
 * @typedef {"read" | "write"} Action
 */
type Action = "read" | "write";
/**
 * Class representing the client state in the swarm system, implementing the IState interface.
 * Manages a single state object with queued read/write operations, middleware support, and event-driven updates via BusService.
 * Integrates with StateConnectionService (state instantiation), ClientAgent (state-driven behavior),
 * SwarmConnectionService (swarm-level state), and BusService (event emission).
 * @template State - The type of the state data, extending IStateData from State.interface.
 * @implements {IState<State>}
 */
declare class ClientState<State extends IStateData = IStateData> implements IState<State> {
    readonly params: IStateParams<State>;
    /**
     * The current state data, initialized as null and set during waitForInit.
     * Updated by setState and clearState, persisted via params.setState if provided.
     * @type {State}
     */
    _state: State;
    /**
     * Queued dispatch function to read or write the state, delegating to DISPATCH_FN.
     * Ensures thread-safe state operations, supporting concurrent access from ClientAgent or tools.
     * @param {Action} action - The action to perform ("read" or "write").
     * @param {DispatchFn<State>} [payload] - The function to update the state, required for "write".
     * @returns {Promise<State>} The current state for "read" or the updated state for "write".
     */
    dispatch: (action: Action, payload?: DispatchFn<State>) => Promise<State>;
    /**
     * Constructs a ClientState instance with the provided parameters.
     * Invokes the onInit callback if provided and logs construction if debugging is enabled.
     * @param {IStateParams<State>} params - The parameters for initializing the state, including clientId, stateName, getState, etc.
     */
    constructor(params: IStateParams<State>);
    /**
     * Waits for the state to initialize via WAIT_FOR_INIT_FN, ensuring it’s only called once using singleshot.
     * Loads the initial state into _state, supporting StateConnectionService’s lifecycle management.
     * @returns {Promise<void>} Resolves when the state is initialized and loaded.
     */
    waitForInit: (() => Promise<void>) & functools_kit.ISingleshotClearable;
    /**
     * Sets the state using the provided dispatch function, applying middlewares and persisting via params.setState.
     * Invokes the onWrite callback and emits an event via BusService, supporting ClientAgent’s state updates.
     * @param {DispatchFn<State>} dispatchFn - The function to update the state, taking the previous state as input.
     * @returns {Promise<State>} The updated state after applying dispatchFn and middlewares.
     */
    setState(dispatchFn: DispatchFn<State>): Promise<State>;
    /**
     * Resets the state to its initial value as determined by params.getState and params.getDefaultState.
     * Persists the result via params.setState, invokes the onWrite callback, and emits an event via BusService.
     * Supports resetting state for ClientAgent or swarm-level operations.
     * @returns {Promise<State>} The reset state after reinitialization.
     */
    clearState(): Promise<State>;
    /**
     * Retrieves the current state from _state via the dispatch queue.
     * Invokes the onRead callback and emits an event via BusService, supporting ClientAgent’s state queries.
     * @returns {Promise<State>} The current state as stored in _state.
     */
    getState(): Promise<State>;
    /**
     * Disposes of the state instance, performing cleanup and invoking the onDispose callback if provided.
     * Ensures proper resource release with StateConnectionService when the state is no longer needed.
     * @returns {Promise<void>} Resolves when disposal is complete and logged.
     */
    dispose(): Promise<void>;
}

/**
 * Service class for managing state connections and operations in the swarm system.
 * Implements IState with a generic type T extending IStateData, providing an interface for state instance management, state manipulation, and lifecycle operations, scoped to clientId and stateName.
 * Handles both client-specific states and delegates to SharedStateConnectionService for shared states, tracked via a _sharedStateSet.
 * Integrates with ClientAgent (state in agent execution), StatePublicService (public state API), SharedStateConnectionService (shared state delegation), AgentConnectionService (state initialization), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientState instances by a composite key (clientId-stateName), and queued to serialize state updates, ensuring efficient reuse and thread-safe modifications.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StateSchemaService for state configuration, SessionValidationService for usage tracking, and SharedStateConnectionService for shared state handling.
 * @template T - The type of state data, extending IStateData, defining the structure of the state.
 * @implements {IState<T>}
 */
declare class StateConnectionService<T extends IStateData = IStateData> implements IState<T> {
    /**
     * Logger service instance, injected via DI, for logging state operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StatePublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Bus service instance, injected via DI, for emitting state-related events.
     * Passed to ClientState for event propagation (e.g., state updates), aligning with BusService’s event system in AgentConnectionService.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Method context service instance, injected via DI, for accessing execution context.
     * Used to retrieve clientId and stateName in method calls, integrating with MethodContextService’s scoping in StatePublicService.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * State schema service instance, injected via DI, for retrieving state configurations.
     * Provides configuration (e.g., persist, getState, setState) to ClientState in getStateRef, aligning with AgentMetaService’s schema management.
     * @type {StateSchemaService}
     * @private
     */
    private readonly stateSchemaService;
    /**
     * Session validation service instance, injected via DI, for tracking state usage.
     * Used in getStateRef and dispose to manage state lifecycle, supporting SessionPublicService’s validation needs.
     * @type {SessionValidationService}
     * @private
     */
    private readonly sessionValidationService;
    /**
     * Shared state connection service instance, injected via DI, for delegating shared state operations.
     * Used in getStateRef to retrieve shared states, integrating with SharedStateConnectionService’s global state management.
     * @type {SharedStateConnectionService}
     * @private
     */
    private readonly sharedStateConnectionService;
    /**
     * Set of state names marked as shared, used to track delegation to SharedStateConnectionService.
     * Populated in getStateRef and checked in dispose to avoid disposing shared states.
     * @type {Set<StateName>}
     * @private
     */
    private _sharedStateSet;
    /**
     * Retrieves or creates a memoized ClientState instance for a given client and state name.
     * Uses functools-kit’s memoize to cache instances by a composite key (clientId-stateName), ensuring efficient reuse across calls.
     * Configures client-specific states with schema data from StateSchemaService, applying persistence via PersistStateAdapter or defaults from GLOBAL_CONFIG, and serializes setState with queued for thread safety.
     * Delegates to SharedStateConnectionService for shared states (shared=true), tracking them in _sharedStateSet.
     * Supports ClientAgent (state in EXECUTE_FN), AgentConnectionService (state initialization), and StatePublicService (public API).
     * @param {string} clientId - The client ID, scoping the state to a specific client, tied to Session.interface and PerfService tracking.
     * @param {StateName} stateName - The name of the state, sourced from State.interface, used in StateSchemaService lookups.
     * @returns {ClientState} The memoized ClientState instance, either client-specific or shared via SharedStateConnectionService.
     */
    getStateRef: ((clientId: string, stateName: StateName) => ClientState<any>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientState<any>>;
    /**
     * Sets the state using a dispatch function that transforms the previous state.
     * Delegates to ClientState.setState after awaiting initialization, using context from MethodContextService to identify the state, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors StatePublicService’s setState, supporting ClientAgent’s state updates with serialized execution via queued in getStateRef.
     * @param {(prevState: T) => Promise<T>} dispatchFn - The function to dispatch the new state, taking the previous state and returning the updated state.
     * @returns {Promise<T>} A promise resolving to the new state after the update.
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;
    /**
     * Clears the state, resetting it to its initial value.
     * Delegates to ClientState.clearState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors StatePublicService’s clearState, supporting ClientAgent’s state reset with serialized execution.
     * @returns {Promise<T>} A promise resolving to the initial state after clearing.
     */
    clearState: () => Promise<T>;
    /**
     * Retrieves the current state.
     * Delegates to ClientState.getState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors StatePublicService’s getState, supporting ClientAgent’s state access.
     * @returns {Promise<T>} A promise resolving to the current state.
     */
    getState: () => Promise<T>;
    /**
     * Disposes of the state connection, cleaning up resources and clearing the memoized instance for client-specific states.
     * Checks if the state exists in the memoization cache and is not shared (via _sharedStateSet) before calling ClientState.dispose, then clears the cache and updates SessionValidationService.
     * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with StatePublicService’s dispose and PerfService’s cleanup.
     * Shared states are not disposed here, as they are managed by SharedStateConnectionService.
     * @returns {Promise<void>} A promise resolving when the state connection is disposed (for client-specific states).
     */
    dispose: () => Promise<void>;
}

/**
 * Interface extending StateConnectionService for type definition purposes.
 * Used to define TStateConnectionService by excluding internal keys, ensuring StatePublicService aligns with public-facing operations.
 * @interface IStateConnectionService
 */
interface IStateConnectionService extends StateConnectionService {
}
/**
 * Type representing keys to exclude from IStateConnectionService (internal methods).
 * Used to filter out non-public methods like getStateRef and getSharedStateRef in TStateConnectionService.
 * @typedef {keyof { getStateRef: never; getSharedStateRef: never }} InternalKeys
 */
type InternalKeys$3 = keyof {
    getStateRef: never;
    getSharedStateRef: never;
};
/**
 * Type representing the public interface of StatePublicService, derived from IStateConnectionService.
 * Excludes internal methods (e.g., getStateRef, getSharedStateRef) via InternalKeys, ensuring a consistent public API for client-specific state operations.
 * @typedef {Object} TStateConnectionService
 */
type TStateConnectionService = {
    [key in Exclude<keyof IStateConnectionService, InternalKeys$3>]: unknown;
};
/**
 * Service class for managing public client-specific state operations in the swarm system, with generic type support for state data.
 * Implements TStateConnectionService to provide a public API for state interactions, delegating to StateConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., managing client-specific state in EXECUTE_FN), PerfService (e.g., tracking sessionState per clientId), and DocService (e.g., documenting state schemas via stateName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like setting, clearing, retrieving, and disposing client-specific state.
 * Contrasts with SharedStatePublicService (system-wide state) and SharedStoragePublicService (persistent storage) by scoping state to individual clients via clientId.
 * @template T - The type of state data, extending IStateData from State.interface, defaulting to IStateData.
 */
declare class StatePublicService<T extends IStateData = IStateData> implements TStateConnectionService {
    /**
     * Logger service instance, injected via DI, for logging state operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * State connection service instance, injected via DI, for underlying state operations.
     * Provides core functionality (e.g., setState, getState) called by public methods, supporting ClientAgent’s client-specific state needs.
     * @type {StateConnectionService}
     * @private
     */
    private readonly stateConnectionService;
    /**
     * Sets the client-specific state using a provided dispatch function, updating the state identified by stateName for a given clientId.
     * Wraps StateConnectionService.setState with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., updating client state in EXECUTE_FN) and PerfService (e.g., tracking state changes in sessionState per client).
     * @param {(prevState: T) => Promise<T>} dispatchFn - The async function to dispatch the state change, taking the previous state and returning the updated state.
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking, scoping the state to a specific client.
     * @param {StateName} stateName - The name of the state, sourced from State.interface, used in DocService documentation.
     * @returns {Promise<T>} A promise resolving to the updated state of type T.
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>, methodName: string, clientId: string, stateName: StateName) => Promise<T>;
    /**
     * Resets the client-specific state to its initial value, identified by stateName for a given clientId.
     * Wraps StateConnectionService.clearState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., resetting client state in EXECUTE_FN) and PerfService (e.g., clearing sessionState for a specific client).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the state reset to a specific client.
     * @param {StateName} stateName - The name of the state to clear, used in DocService documentation.
     * @returns {Promise<T>} A promise resolving to the initial state of type T.
     */
    clearState: (methodName: string, clientId: string, stateName: StateName) => Promise<T>;
    /**
     * Retrieves the current client-specific state identified by stateName for a given clientId.
     * Wraps StateConnectionService.getState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., accessing client state in EXECUTE_FN) and PerfService (e.g., reading sessionState for a specific client).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the state retrieval to a specific client.
     * @param {StateName} stateName - The name of the state to retrieve, used in DocService documentation.
     * @returns {Promise<T>} A promise resolving to the current state of type T.
     */
    getState: (methodName: string, clientId: string, stateName: StateName) => Promise<T>;
    /**
     * Disposes of the client-specific state identified by stateName for a given clientId, cleaning up resources.
     * Wraps StateConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN) and PerfService’s dispose (e.g., clearing client-specific sessionState).
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID, scoping the state disposal to a specific client.
     * @param {StateName} stateName - The name of the state to dispose, used in DocService documentation.
     * @returns {Promise<void>} A promise resolving when the state is disposed.
     */
    dispose: (methodName: string, clientId: string, stateName: StateName) => Promise<void>;
}

/**
 * Service class for managing state schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IStateSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with StateConnectionService and SharedStateConnectionService (state configuration for ClientState), ClientAgent (state usage in execution), AgentSchemaService (state references in agent schemas), and StatePublicService (public state API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining state configurations (e.g., getState function, middlewares) used by client-specific and shared states within the swarm ecosystem.
 */
declare class StateSchemaService {
    /**
     * Logger service instance, injected via DI, for logging state schema operations.
     * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StateConnectionService and PerfService logging patterns.
     * @type {LoggerService}
     * @readonly
     */
    readonly loggerService: LoggerService;
    /**
     * Registry instance for storing state schemas, initialized with ToolRegistry from functools-kit.
     * Maps StateName keys to IStateSchema values, providing efficient storage and retrieval, used in register and get methods.
     * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
     * @type {ToolRegistry<Record<StateName, IStateSchema>>}
     * @private
     */
    private registry;
    /**
     * Validates a state schema shallowly, ensuring required fields and optional properties meet basic integrity constraints.
     * Checks stateName as a string and getState as a function (required for state retrieval), and ensures middlewares, if present, is an array of functions.
     * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StateConnectionService’s configuration needs.
     * Supports ClientState instantiation in StateConnectionService and SharedStateConnectionService by ensuring schema validity before registration.
     * @param {IStateSchema} stateSchema - The state schema to validate, sourced from State.interface.
     * @throws {Error} If any validation check fails, with detailed messages including stateName.
     * @private
     */
    private validateShallow;
    /**
     * Registers a new state schema in the registry after validation.
     * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (stateName).
     * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StateConnectionService’s state management.
     * Supports ClientAgent execution by providing validated state schemas to StateConnectionService and SharedStateConnectionService for ClientState configuration.
     * @param {StateName} key - The name of the state, used as the registry key, sourced from State.interface.
     * @param {IStateSchema} value - The state schema to register, sourced from State.interface, validated before storage.
     * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
     */
    register: (key: StateName, value: IStateSchema) => void;
    /**
     * Retrieves a state schema from the registry by its name.
     * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports StateConnectionService and SharedStateConnectionService by providing state configuration (e.g., getState, middlewares) for ClientState instantiation, referenced in AgentSchemaService schemas.
     * @param {StateName} key - The name of the state to retrieve, sourced from State.interface.
     * @returns {IStateSchema} The state schema associated with the key, sourced from State.interface, including getState and optional middlewares.
     * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
     */
    get: (key: StateName) => IStateSchema;
}

/**
 * Service class implementing the IBus interface to manage event subscriptions and emissions in the swarm system.
 * Provides methods to subscribe to events (subscribe, once), emit events (emit, commitExecutionBegin, commitExecutionEnd), and dispose of subscriptions (dispose), using a memoized Subject per clientId and EventSource.
 * Integrates with ClientAgent (e.g., execution events in EXECUTE_FN), PerfService (e.g., execution tracking via emit), and DocService (e.g., performance logging), leveraging LoggerService for info-level logging and SessionValidationService for session validation.
 * Supports wildcard subscriptions (clientId="*") and execution-specific event aliases, enhancing event-driven communication across the system.
 */
declare class BusService implements IBus {
    /**
     * Logger service instance, injected via DI, for logging bus operations.
     * Used in methods like subscribe, emit, and dispose when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with PerfService and DocService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Session validation service instance, injected via DI, for checking active client sessions.
     * Used in emit to ensure events are only emitted for valid sessions, aligning with ClientAgent’s session management (e.g., clientId validation).
     * @type {SessionValidationService}
     * @private
     */
    private readonly sessionValidationService;
    /**
     * Set of registered event sources, tracking all unique EventSource values from subscriptions.
     * Used in dispose to clean up subscriptions for a clientId, ensuring comprehensive resource management.
     * @type {Set<EventSource>}
     * @private
     */
    private _eventSourceSet;
    /**
     * Map indicating wildcard subscriptions (clientId="*") for each EventSource.
     * Used in emit to broadcast events to wildcard subscribers, enhancing flexibility in event handling (e.g., system-wide monitoring).
     * @type {Map<EventSource, boolean>}
     * @private
     */
    private _eventWildcardMap;
    /**
     * Memoized factory function to create or retrieve a Subject for a clientId and EventSource pair.
     * Uses memoize from functools-kit with a key of `${clientId}-${source}`, optimizing performance by reusing Subjects, integral to subscribe, once, and emit operations.
     * @type {(clientId: string, source: EventSource) => Subject<IBaseEvent>}
     * @private
     */
    private getEventSubject;
    /**
     * Subscribes to events for a specific client and event source, invoking the callback for each matching event.
     * Registers the source in _eventSourceSet and supports wildcard subscriptions (clientId="*") via _eventWildcardMap, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., to monitor execution events) and PerfService (e.g., to track execution metrics indirectly via events).
     * @template T - The event type extending IBaseEvent.
     * @param {string} clientId - The client ID to subscribe for, or "*" for wildcard subscription.
     * @param {EventSource} source - The event source to listen to (e.g., "execution-bus").
     * @param {(event: T) => void} fn - The callback function to handle emitted events.
     * @returns {Subscription} The subscription object, allowing unsubscribe.
     */
    subscribe: <T extends IBaseEvent>(clientId: string, source: EventSource, fn: (event: T) => void) => () => void;
    /**
     * Subscribes to a single event for a specific client and event source, invoking the callback once when the filter condition is met.
     * Registers the source in _eventSourceSet and supports wildcard subscriptions, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Useful for one-time event handling (e.g., ClientAgent awaiting execution completion), complementing subscribe.
     * @template T - The event type extending IBaseEvent.
     * @param {string} clientId - The client ID to subscribe for, or "*" for wildcard subscription.
     * @param {EventSource} source - The event source to listen to (e.g., "execution-bus").
     * @param {(event: T) => boolean} filterFn - The filter function to determine if the event should trigger the callback.
     * @param {(event: T) => void} fn - The callback function to handle the filtered event.
     * @returns {Subscription} The subscription object, automatically unsubscribed after the first match.
     */
    once: <T extends IBaseEvent>(clientId: string, source: EventSource, filterFn: (event: T) => boolean, fn: (event: T) => void) => () => void;
    /**
     * Emits an event for a specific client, broadcasting to subscribers of the event’s source, including wildcard subscribers.
     * Validates the client session with SessionValidationService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, and supports PerfService execution tracking (e.g., via commitExecutionBegin).
     * @template T - The event type extending IBaseEvent.
     * @param {string} clientId - The client ID to emit the event for, tied to ClientAgent sessions.
     * @param {T} event - The event object to emit, containing source, type, and other properties.
     * @returns {Promise<void>} A promise resolving when the event has been emitted to all subscribers.
     */
    emit: <T extends IBaseEvent>(clientId: string, event: T) => Promise<void>;
    /**
     * Emits an execution begin event for a specific client, serving as an alias for emit with a predefined IBusEvent structure.
     * Logs via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used in ClientAgent (e.g., EXECUTE_FN start) and PerfService (e.g., startExecution trigger).
     * @param {string} clientId - The client ID initiating the execution, tied to ClientAgent sessions.
     * @param {Partial<IBusEventContext>} context - Contextual data for the execution event (e.g., method or execution context).
     * @returns {Promise<void>} A promise resolving when the execution begin event is emitted.
     */
    commitExecutionBegin: (clientId: string, context: Partial<IBusEventContext>) => Promise<void>;
    /**
     * Emits an execution end event for a specific client, serving as an alias for emit with a predefined IBusEvent structure.
     * Logs via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used in ClientAgent (e.g., EXECUTE_FN completion) and PerfService (e.g., endExecution trigger).
     * @param {string} clientId - The client ID completing the execution, tied to ClientAgent sessions.
     * @param {Partial<IBusEventContext>} context - Contextual data for the execution event (e.g., method or execution context).
     * @returns {Promise<void>} A promise resolving when the execution end event is emitted.
     */
    commitExecutionEnd: (clientId: string, context: Partial<IBusEventContext>) => Promise<void>;
    /**
     * Disposes of all event subscriptions for a specific client, unsubscribing and clearing Subjects for all registered sources.
     * Logs via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with PerfService’s dispose (e.g., session cleanup) and ClientAgent’s session termination.
     * @param {string} clientId - The client ID whose subscriptions are to be disposed, tied to ClientAgent sessions.
     * @returns {void}
     */
    dispose: (clientId: string) => void;
}

/**
 * Interface defining a metadata node structure for representing agent relationships and resources.
 * Used in AgentMetaService to build hierarchical trees for UML serialization, reflecting agent dependencies and attributes.
 * @interface IMetaNode
 */
interface IMetaNode {
    /**
     * The name of the node, typically an agent name or resource identifier (e.g., AgentName, "States").
     * @type {string}
     */
    name: string;
    /**
     * Optional array of child nodes, representing nested dependencies or resources (e.g., dependent agents, states).
     * @type {IMetaNode[] | undefined}
     */
    child?: IMetaNode[];
}
/**
 * Service class for managing agent metadata and converting it to UML format in the swarm system.
 * Builds IMetaNode trees from agent schemas (via AgentSchemaService) and serializes them to UML for visualization, integrating with DocService (e.g., writeAgentDoc UML diagrams).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and supports ClientAgent (e.g., agent metadata) and PerfService (e.g., computeClientState context).
 * Provides methods to create detailed or common agent nodes and generate UML strings, enhancing system documentation and debugging.
 */
declare class AgentMetaService {
    /**
     * Logger service instance, injected via DI, for logging meta node operations.
     * Used in makeAgentNode, makeAgentNodeCommon, and toUML when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with DocService and PerfService logging.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Agent schema service instance, injected via DI, for retrieving agent schema data (e.g., dependsOn, states).
     * Used in makeAgentNode and makeAgentNodeCommon to build meta nodes, aligning with ClientAgent’s agent definitions and DocService’s agent documentation.
     * @type {AgentSchemaService}
     * @private
     */
    private readonly agentSchemaService;
    /**
     * Serialization function created by createSerialize, used to convert IMetaNode trees to UML format.
     * Employed in toUML to generate strings for DocService’s UML diagrams (e.g., agent_schema_[agentName].svg).
     * @type {(nodes: IMetaNode[]) => string}
     * @private
     */
    private serialize;
    /**
     * Creates a detailed meta node for the given agent, including dependencies, states, storages, and tools.
     * Recursively builds a tree with seen set to prevent cycles, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used in toUML for full agent visualization.
     * Integrates with ClientAgent (e.g., agent metadata) and DocService (e.g., detailed agent UML in writeAgentDoc).
     * @param {AgentName} agentName - The name of the agent to create a meta node for, sourced from Agent.interface.
     * @param {Set<AgentName>} [seen=new Set<AgentName>()] - Set of seen agent names to prevent infinite recursion, defaults to an empty set.
     * @returns {IMetaNode} The created meta node with child nodes for dependencies, states, storages, and tools.
     */
    makeAgentNode: (agentName: AgentName, seen?: Set<string>) => IMetaNode;
    /**
     * Creates a common meta node for the given agent, focusing on dependency relationships.
     * Recursively builds a tree with seen set to prevent cycles, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used as a helper in makeAgentNode.
     * Supports ClientAgent (e.g., dependency tracking) and PerfService (e.g., computeClientState agent context).
     * @param {AgentName} agentName - The name of the agent to create a meta node for, sourced from Agent.interface.
     * @param {Set<AgentName>} [seen=new Set<AgentName>()] - Set of seen agent names to prevent infinite recursion, defaults to an empty set.
     * @returns {IMetaNode} The created meta node with child nodes for dependencies only.
     */
    makeAgentNodeCommon: (agentName: AgentName, seen?: Set<string>) => IMetaNode;
    /**
     * Converts the meta nodes of the given agent to UML format, optionally including a full subtree.
     * Uses makeAgentNode to build the tree and serialize to generate the UML string, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Called by DocService (e.g., writeAgentDoc) to produce UML diagrams (e.g., agent_schema_[agentName].svg), enhancing agent visualization.
     * @param {AgentName} agentName - The name of the agent to convert to UML, sourced from Agent.interface.
     * @param {boolean} [withSubtree=false] - Whether to include the full subtree (dependencies, states, etc.) or limit recursion, defaults to false.
     * @returns {string} The UML representation of the agent’s meta nodes, formatted as YAML for PlantUML rendering.
     */
    toUML: (agentName: AgentName, withSubtree?: boolean) => string;
}

/**
 * Service class for managing swarm metadata and converting it to UML format in the swarm system.
 * Builds IMetaNode trees from swarm schemas (via SwarmSchemaService) and serializes them to UML for visualization, integrating with DocService (e.g., writeSwarmDoc UML diagrams).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), AgentMetaService for agent node creation, and supports ClientAgent (e.g., swarm-agent relationships) and PerfService (e.g., computeClientState context).
 * Provides methods to create swarm nodes and generate UML strings, enhancing system documentation and debugging.
 */
declare class SwarmMetaService {
    /**
     * Logger service instance, injected via DI, for logging swarm metadata operations.
     * Used in makeSwarmNode and toUML when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with DocService and AgentMetaService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Swarm schema service instance, injected via DI, for retrieving swarm schema data (e.g., defaultAgent).
     * Used in makeSwarmNode to build meta nodes, aligning with ClientAgent’s swarm definitions and DocService’s swarm documentation.
     * @type {SwarmSchemaService}
     * @private
     */
    private readonly swarmSchemaService;
    /**
     * Agent meta service instance, injected via DI, for creating agent meta nodes within swarm trees.
     * Used in makeSwarmNode to include the default agent, linking to ClientAgent’s agent metadata and DocService’s agent UML generation.
     * @type {AgentMetaService}
     * @private
     */
    private readonly agentMetaService;
    /**
     * Serialization function created by createSerialize from AgentMetaService, used to convert IMetaNode trees to UML format.
     * Employed in toUML to generate strings for DocService’s UML diagrams (e.g., swarm_schema_[swarmName].svg), ensuring consistency with AgentMetaService.
     * @type {(nodes: IMetaNode[]) => string}
     * @private
     */
    private serialize;
    /**
     * Creates a meta node for the given swarm, including its default agent as a child node.
     * Builds a tree using SwarmSchemaService for swarm data and AgentMetaService for the default agent node, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., swarm-agent linkage) and DocService (e.g., swarm UML in writeSwarmDoc), used in toUML for visualization.
     * @param {SwarmName} swarmName - The name of the swarm to create a meta node for, sourced from Swarm.interface.
     * @returns {IMetaNode} The created meta node with the swarm name and its default agent as a child.
     */
    makeSwarmNode: (swarmName: SwarmName) => IMetaNode;
    /**
     * Converts the swarm metadata to UML format for visualization.
     * Uses makeSwarmNode to build the tree and serialize to generate the UML string, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Called by DocService (e.g., writeSwarmDoc) to produce UML diagrams (e.g., swarm_schema_[swarmName].svg), enhancing swarm visualization.
     * @param {SwarmName} swarmName - The name of the swarm to convert to UML, sourced from Swarm.interface.
     * @returns {string} The UML representation of the swarm’s meta nodes, formatted as YAML for PlantUML rendering.
     */
    toUML: (swarmName: SwarmName) => string;
}

/**
 * Service class for generating and writing documentation for swarms, agents, and performance data in the swarm system.
 * Produces Markdown files for swarm (ISwarmSchema) and agent (IAgentSchema) schemas, including UML diagrams via CC_FN_PLANTUML, and JSON files for performance metrics via PerfService.
 * Integrates indirectly with ClientAgent by documenting its schema (e.g., tools, prompts) and performance (e.g., via PerfService), using LoggerService for logging gated by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
 * Manages concurrent tasks with a thread pool (THREAD_POOL_SIZE) and organizes output in a directory structure (SUBDIR_LIST), enhancing developer understanding of the system.
 */
declare class DocService {
    /**
     * Logger service instance for logging documentation generation activities, injected via dependency injection.
     * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, used in methods like dumpDocs, writeSwarmDoc, and writeAgentDoc for info-level logging.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Performance service instance for retrieving system and client performance data, injected via DI.
     * Used in dumpPerfomance and dumpClientPerfomance to serialize IPerformanceRecord and IClientPerfomanceRecord data into JSON files.
     * @type {PerfService}
     * @private
     */
    private readonly perfService;
    /**
     * Swarm validation service instance, injected via DI.
     * Provides the list of swarm names for dumpDocs, ensuring only valid swarms are documented.
     * @type {SwarmValidationService}
     * @private
     */
    private readonly swarmValidationService;
    /**
     * Agent validation service instance, injected via DI.
     * Provides the list of agent names for dumpDocs, ensuring only valid agents are documented.
     * @type {AgentValidationService}
     * @private
     */
    private readonly agentValidationService;
    /**
     * Swarm schema service instance, injected via DI.
     * Retrieves ISwarmSchema objects for writeSwarmDoc, supplying swarm details like agents and policies.
     * @type {SwarmSchemaService}
     * @private
     */
    private readonly swarmSchemaService;
    /**
     * Agent schema service instance, injected via DI.
     * Retrieves IAgentSchema objects for writeAgentDoc and agent descriptions in writeSwarmDoc, providing details like tools and prompts.
     * @type {AgentSchemaService}
     * @private
     */
    private readonly agentSchemaService;
    /**
     * Policy schema service instance, injected via DI.
     * Supplies policy descriptions for writeSwarmDoc, documenting banhammer policies associated with swarms.
     * @type {PolicySchemaService}
     * @private
     */
    private readonly policySchemaService;
    /**
     * Tool schema service instance, injected via DI.
     * Provides tool details (e.g., function, callbacks) for writeAgentDoc, documenting tools used by agents (e.g., ClientAgent tools).
     * @type {ToolSchemaService}
     * @private
     */
    private readonly toolSchemaService;
    /**
     * Storage schema service instance, injected via DI.
     * Supplies storage details for writeAgentDoc, documenting storage resources used by agents.
     * @type {StorageSchemaService}
     * @private
     */
    private readonly storageSchemaService;
    /**
     * State schema service instance, injected via DI.
     * Provides state details for writeAgentDoc, documenting state resources used by agents.
     * @type {StateSchemaService}
     * @private
     */
    private readonly stateSchemaService;
    /**
     * Agent meta service instance, injected via DI.
     * Generates UML diagrams for agents in writeAgentDoc, enhancing documentation with visual schema representations.
     * @type {AgentMetaService}
     * @private
     */
    private readonly agentMetaService;
    /**
     * Swarm meta service instance, injected via DI.
     * Generates UML diagrams for swarms in writeSwarmDoc, enhancing documentation with visual schema representations.
     * @type {SwarmMetaService}
     * @private
     */
    private readonly swarmMetaService;
    /**
     * Writes Markdown documentation for a swarm schema, detailing its name, description, UML diagram, agents, policies, and callbacks.
     * Executes in a thread pool (THREAD_POOL_SIZE) to manage concurrency, logging via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
     * Outputs to dirName/[swarmName].md, with UML images in dirName/image, and links to agent docs in dirName/agent, sourced from swarmSchemaService.
     * @param {ISwarmSchema} swarmSchema - The swarm schema to document, including properties like defaultAgent and policies.
     * @param {string} dirName - The base directory for documentation output.
     * @returns {Promise<void>} A promise resolving when the swarm documentation file is written.
     * @private
     */
    private writeSwarmDoc;
    /**
     * Writes Markdown documentation for an agent schema, detailing its name, description, UML diagram, prompts, tools, storages, states, and callbacks.
     * Executes in a thread pool (THREAD_POOL_SIZE) to manage concurrency, logging via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
     * Outputs to dirName/agent/[agentName].md, with UML images in dirName/image, sourced from agentSchemaService and related services (e.g., toolSchemaService).
     * @param {IAgentSchema} agentSchema - The agent schema to document, including properties like tools and prompts (e.g., ClientAgent configuration).
     * @param {string} dirName - The base directory for documentation output.
     * @returns {Promise<void>} A promise resolving when the agent documentation file is written.
     * @private
     */
    private writeAgentDoc;
    /**
     * Generates and writes documentation for all swarms and agents in the system.
     * Creates subdirectories (SUBDIR_LIST), then concurrently writes swarm and agent docs using writeSwarmDoc and writeAgentDoc, logging progress if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
     * Outputs to a directory structure rooted at dirName (default: "docs/chat"), integrating with ClientAgent by documenting its schema.
     * @param {string} [dirName=join(process.cwd(), "docs/chat")] - The base directory for documentation output, defaults to "docs/chat" in the current working directory.
     * @returns {Promise<void>} A promise resolving when all documentation files are written.
     */
    dumpDocs: (dirName?: string) => Promise<void>;
    /**
     * Dumps system-wide performance data to a JSON file using PerfService.toRecord.
     * Ensures the output directory exists, then writes a timestamped file, logging the process if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
     * Outputs to dirName/[momentStamp].[timeStamp].json (default: "logs/meta"), providing a snapshot of system performance (e.g., tied to ClientAgent executions).
     * @param {string} [dirName=join(process.cwd(), "logs/meta")] - The directory for performance data output, defaults to "logs/meta" in the current working directory.
     * @returns {Promise<void>} A promise resolving when the performance data file is written.
     */
    dumpPerfomance: (dirName?: string) => Promise<void>;
    /**
     * Dumps performance data for a specific client to a JSON file using PerfService.toClientRecord.
     * Ensures the output directory exists, then writes a client-specific timestamped file, logging the process if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
     * Outputs to dirName/[clientId].[momentStamp].json (default: "logs/client"), documenting client-specific metrics (e.g., ClientAgent session performance).
     * @param {string} clientId - The unique identifier of the client session to document.
     * @param {string} [dirName=join(process.cwd(), "logs/client")] - The directory for client performance data output, defaults to "logs/client" in the current working directory.
     * @returns {Promise<void>} A promise resolving when the client performance data file is written.
     */
    dumpClientPerfomance: (clientId: string, dirName?: string) => Promise<void>;
}

/**
 * Service class for managing shared storage connections and operations in the swarm system.
 * Implements IStorage to provide an interface for shared storage instance management, data manipulation, and retrieval, scoped to storageName across all clients (using a fixed clientId of "shared").
 * Integrates with ClientAgent (shared storage in agent execution), StoragePublicService (client-specific storage counterpart), SharedStoragePublicService (public shared storage API), AgentConnectionService (storage initialization), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientStorage instances by storageName, ensuring a single shared instance across all clients.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StorageSchemaService for storage configuration and EmbeddingSchemaService for embedding functionality, applying persistence via PersistStorageAdapter or defaults from GLOBAL_CONFIG.
 * @implements {IStorage}
 */
declare class SharedStorageConnectionService implements IStorage {
    /**
     * Logger service instance, injected via DI, for logging shared storage operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SharedStoragePublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Bus service instance, injected via DI, for emitting storage-related events.
     * Passed to ClientStorage for event propagation (e.g., storage updates), aligning with BusService’s event system in AgentConnectionService.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Method context service instance, injected via DI, for accessing execution context.
     * Used to retrieve storageName in method calls, integrating with MethodContextService’s scoping in SharedStoragePublicService.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * Storage schema service instance, injected via DI, for retrieving storage configurations.
     * Provides configuration (e.g., persist, getData, embedding) to ClientStorage in getStorage, aligning with AgentMetaService’s schema management.
     * @type {StorageSchemaService}
     * @private
     */
    private readonly storageSchemaService;
    /**
     * Embedding schema service instance, injected via DI, for retrieving embedding configurations.
     * Provides embedding logic (e.g., calculateSimilarity, createEmbedding) to ClientStorage in getStorage, supporting similarity-based retrieval in take.
     * @type {EmbeddingSchemaService}
     * @private
     */
    private readonly embeddingSchemaService;
    /**
     * Retrieves or creates a memoized ClientStorage instance for a given shared storage name.
     * Uses functools-kit’s memoize to cache instances by storageName, ensuring a single shared instance across all clients (fixed clientId: "shared").
     * Configures the storage with schema data from StorageSchemaService, embedding logic from EmbeddingSchemaService, and persistence via PersistStorageAdapter or defaults from GLOBAL_CONFIG, enforcing shared=true via an error check.
     * Supports ClientAgent (shared storage in EXECUTE_FN), AgentConnectionService (storage initialization), and SharedStoragePublicService (public API).
     * @param {StorageName} storageName - The name of the shared storage, sourced from Storage.interface, used in StorageSchemaService lookups.
     * @returns {ClientStorage} The memoized ClientStorage instance configured for the shared storage.
     * @throws {Error} If the storage is not marked as shared in the schema.
     */
    getStorage: ((storageName: StorageName) => ClientStorage<any>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientStorage<any>>;
    /**
     * Retrieves a list of storage data items based on a search query, total count, and optional similarity score.
     * Delegates to ClientStorage.take after awaiting initialization, using context from MethodContextService to identify the storage, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SharedStoragePublicService’s take, supporting ClientAgent’s similarity-based data retrieval with embedding support from EmbeddingSchemaService.
     * @param {string} search - The search query to filter storage items.
     * @param {number} total - The maximum number of items to retrieve.
     * @param {number} [score] - The optional similarity score threshold for filtering.
     * @returns {Promise<IStorageData[]>} A promise resolving to an array of storage data items matching the query.
     */
    take: (search: string, total: number, score?: number) => Promise<IStorageData[]>;
    /**
     * Upserts an item into the shared storage, inserting or updating based on its ID.
     * Delegates to ClientStorage.upsert after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SharedStoragePublicService’s upsert, supporting ClientAgent’s data persistence.
     * @param {IStorageData} item - The item to upsert, sourced from Storage.interface, containing id and data.
     * @returns {Promise<void>} A promise resolving when the item is upserted.
     */
    upsert: (item: IStorageData) => Promise<void>;
    /**
     * Removes an item from the shared storage by its ID.
     * Delegates to ClientStorage.remove after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SharedStoragePublicService’s remove, supporting ClientAgent’s data deletion.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove, sourced from Storage.interface.
     * @returns {Promise<void>} A promise resolving when the item is removed.
     */
    remove: (itemId: IStorageData["id"]) => Promise<void>;
    /**
     * Retrieves an item from the shared storage by its ID.
     * Delegates to ClientStorage.get after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SharedStoragePublicService’s get, supporting ClientAgent’s data access.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve, sourced from Storage.interface.
     * @returns {Promise<IStorageData | null>} A promise resolving to the retrieved item or null if not found.
     */
    get: (itemId: IStorageData["id"]) => Promise<IStorageData | null>;
    /**
     * Retrieves a list of items from the shared storage, optionally filtered by a predicate function.
     * Delegates to ClientStorage.list after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SharedStoragePublicService’s list, supporting ClientAgent’s bulk data access.
     * @param {(item: IStorageData) => boolean} [filter] - The optional filter function to apply to the storage items.
     * @returns {Promise<IStorageData[]>} A promise resolving to an array of storage data items, filtered if a predicate is provided.
     */
    list: (filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>;
    /**
     * Clears all items from the shared storage, resetting it to its default state.
     * Delegates to ClientStorage.clear after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SharedStoragePublicService’s clear, supporting ClientAgent’s storage reset.
     * @returns {Promise<void>} A promise resolving when the storage is cleared.
     */
    clear: () => Promise<void>;
}

/**
 * Service class for managing shared state connections and operations in the swarm system.
 * Implements IState with a generic type T extending IStateData, providing an interface for shared state instance management, state manipulation, and state access, scoped to stateName across all clients (using a fixed clientId of "shared").
 * Integrates with ClientAgent (shared state in agent execution), StatePublicService (client-specific state counterpart), SharedStatePublicService (public shared state API), AgentConnectionService (state initialization), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientState instances by stateName, and queued to serialize state updates, ensuring efficient reuse and thread-safe modifications.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StateSchemaService for state configuration, applying persistence via PersistStateAdapter or defaults from GLOBAL_CONFIG.
 * @template T - The type of state data, extending IStateData, defining the structure of the shared state.
 * @implements {IState<T>}
 */
declare class SharedStateConnectionService<T extends IStateData = IStateData> implements IState<T> {
    /**
     * Logger service instance, injected via DI, for logging shared state operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SharedStatePublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Bus service instance, injected via DI, for emitting state-related events.
     * Passed to ClientState for event propagation (e.g., state updates), aligning with BusService’s event system in AgentConnectionService.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Method context service instance, injected via DI, for accessing execution context.
     * Used to retrieve stateName in method calls, integrating with MethodContextService’s scoping in SharedStatePublicService.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * State schema service instance, injected via DI, for retrieving state configurations.
     * Provides configuration (e.g., persist, getState, setState) to ClientState in getStateRef, aligning with AgentMetaService’s schema management.
     * @type {StateSchemaService}
     * @private
     */
    private readonly stateSchemaService;
    /**
     * Retrieves or creates a memoized ClientState instance for a given shared state name.
     * Uses functools-kit’s memoize to cache instances by stateName, ensuring a single shared instance across all clients (fixed clientId: "shared").
     * Configures the state with schema data from StateSchemaService, applying persistence via PersistStateAdapter or defaults from GLOBAL_CONFIG, and enforces shared=true via an error check.
     * Serializes setState operations with queued if setState is provided, ensuring thread-safe updates.
     * Supports ClientAgent (shared state in EXECUTE_FN), AgentConnectionService (state initialization), and SharedStatePublicService (public API).
     * @param {StateName} stateName - The name of the shared state, sourced from State.interface, used in StateSchemaService lookups.
     * @returns {ClientState} The memoized ClientState instance configured for the shared state.
     * @throws {Error} If the state is not marked as shared in the schema.
     */
    getStateRef: ((stateName: StateName) => ClientState<any>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientState<any>>;
    /**
     * Sets the shared state using a dispatch function that transforms the previous state.
     * Delegates to ClientState.setState after awaiting initialization, using context from MethodContextService to identify the state, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SharedStatePublicService’s setState, supporting ClientAgent’s state updates with serialized execution via queued in getStateRef.
     * @param {(prevState: T) => Promise<T>} dispatchFn - The function to dispatch the new state, taking the previous state and returning the updated state.
     * @returns {Promise<T>} A promise resolving to the new state after the update.
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;
    /**
     * Clears the shared state, resetting it to its initial value.
     * Delegates to ClientState.clearState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SharedStatePublicService’s clearState, supporting ClientAgent’s state reset with serialized execution.
     * @returns {Promise<T>} A promise resolving to the initial state after clearing.
     */
    clearState: () => Promise<T>;
    /**
     * Retrieves the current shared state.
     * Delegates to ClientState.getState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors SharedStatePublicService’s getState, supporting ClientAgent’s state access.
     * @returns {Promise<T>} A promise resolving to the current shared state.
     */
    getState: () => Promise<T>;
}

/**
 * Interface extending SharedStateConnectionService for type definition purposes.
 * Used to define TSharedStateConnectionService by excluding internal keys, ensuring SharedStatePublicService aligns with public-facing operations.
 * @interface ISharedStateConnectionService
 */
interface ISharedStateConnectionService extends SharedStateConnectionService {
}
/**
 * Type representing keys to exclude from ISharedStateConnectionService (internal methods).
 * Used to filter out non-public methods like getStateRef and getSharedStateRef in TSharedStateConnectionService.
 * @typedef {keyof { getStateRef: never; getSharedStateRef: never }} InternalKeys
 */
type InternalKeys$2 = keyof {
    getStateRef: never;
    getSharedStateRef: never;
};
/**
 * Type representing the public interface of SharedStatePublicService, derived from ISharedStateConnectionService.
 * Excludes internal methods (e.g., getStateRef, getSharedStateRef) via InternalKeys, ensuring a consistent public API for shared state operations.
 * @typedef {Object} TSharedStateConnectionService
 */
type TSharedStateConnectionService = {
    [key in Exclude<keyof ISharedStateConnectionService, InternalKeys$2>]: unknown;
};
/**
 * Service class for managing public shared state operations in the swarm system, with generic type support for state data.
 * Implements TSharedStateConnectionService to provide a public API for shared state interactions, delegating to SharedStateConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with PerfService (e.g., sessionState tracking in computeClientState), ClientAgent (e.g., state management in EXECUTE_FN), and DocService (e.g., documenting state schemas via stateName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like setting, clearing, and retrieving shared state across the system.
 * @template T - The type of state data, extending IStateData from State.interface, defaulting to IStateData.
 */
declare class SharedStatePublicService<T extends IStateData = IStateData> implements TSharedStateConnectionService {
    /**
     * Logger service instance, injected via DI, for logging shared state operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Shared state connection service instance, injected via DI, for underlying state operations.
     * Provides core functionality (e.g., setState, getState) called by public methods, supporting ClientAgent’s state management needs.
     * @type {SharedStateConnectionService}
     * @private
     */
    private readonly sharedStateConnectionService;
    /**
     * Sets the shared state using a provided dispatch function, updating the state identified by stateName.
     * Wraps SharedStateConnectionService.setState with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., updating state in EXECUTE_FN) and PerfService (e.g., tracking state changes in sessionState).
     * @param {(prevState: T) => Promise<T>} dispatchFn - The async function to dispatch the state change, taking the previous state and returning the updated state.
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {StateName} stateName - The name of the shared state, sourced from State.interface, used in DocService documentation.
     * @returns {Promise<T>} A promise resolving to the updated state of type T.
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>, methodName: string, stateName: StateName) => Promise<T>;
    /**
     * Resets the shared state to its initial value, identified by stateName.
     * Wraps SharedStateConnectionService.clearState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., resetting state in EXECUTE_FN) and PerfService (e.g., clearing sessionState for performance resets).
     * @param {string} methodName - The method name for context and logging.
     * @param {StateName} stateName - The name of the shared state to clear, used in DocService documentation.
     * @returns {Promise<T>} A promise resolving to the initial state of type T.
     */
    clearState: (methodName: string, stateName: StateName) => Promise<T>;
    /**
     * Retrieves the current shared state identified by stateName.
     * Wraps SharedStateConnectionService.getState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., accessing state in EXECUTE_FN) and PerfService (e.g., reading sessionState for metrics).
     * @param {string} methodName - The method name for context and logging.
     * @param {StateName} stateName - The name of the shared state to retrieve, used in DocService documentation.
     * @returns {Promise<T>} A promise resolving to the current state of type T.
     */
    getState: (methodName: string, stateName: StateName) => Promise<T>;
}

/**
 * Interface extending SharedStorageConnectionService for type definition purposes.
 * Used to define TSharedStorageConnectionService by excluding internal keys, ensuring SharedStoragePublicService aligns with public-facing operations.
 * @interface ISharedStorageConnectionService
 */
interface ISharedStorageConnectionService extends SharedStorageConnectionService {
}
/**
 * Type representing keys to exclude from ISharedStorageConnectionService (internal methods).
 * Used to filter out non-public methods like getStorage and getSharedStorage in TSharedStorageConnectionService.
 * @typedef {keyof { getStorage: never; getSharedStorage: never }} InternalKeys
 */
type InternalKeys$1 = keyof {
    getStorage: never;
    getSharedStorage: never;
};
/**
 * Type representing the public interface of SharedStoragePublicService, derived from ISharedStorageConnectionService.
 * Excludes internal methods (e.g., getStorage, getSharedStorage) via InternalKeys, ensuring a consistent public API for shared storage operations.
 * @typedef {Object} TSharedStorageConnectionService
 */
type TSharedStorageConnectionService = {
    [key in Exclude<keyof ISharedStorageConnectionService, InternalKeys$1>]: unknown;
};
/**
 * Service class for managing public shared storage operations in the swarm system.
 * Implements TSharedStorageConnectionService to provide a public API for shared storage interactions, delegating to SharedStorageConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., storing/retrieving data in EXECUTE_FN), PerfService (e.g., tracking storage usage in sessionState), and DocService (e.g., documenting storage schemas via storageName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like retrieving, upserting, removing, listing, and clearing items in shared storage across the system.
 */
declare class SharedStoragePublicService implements TSharedStorageConnectionService {
    /**
     * Logger service instance, injected via DI, for logging shared storage operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SharedStatePublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Shared storage connection service instance, injected via DI, for underlying storage operations.
     * Provides core functionality (e.g., take, upsert) called by public methods, supporting ClientAgent’s storage needs.
     * @type {SharedStorageConnectionService}
     * @private
     */
    private readonly sharedStorageConnectionService;
    /**
     * Retrieves a list of storage items based on a search query, total count, and optional score, from a storage identified by storageName.
     * Wraps SharedStorageConnectionService.take with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., searching storage in EXECUTE_FN) and DocService (e.g., documenting searchable storage data).
     * @param {string} search - The search query to filter storage items.
     * @param {number} total - The maximum number of items to retrieve.
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {StorageName} storageName - The name of the shared storage, sourced from Storage.interface, used in DocService documentation.
     * @param {number} [score] - An optional score for ranking or filtering items (e.g., relevance score).
     * @returns {Promise<IStorageData[]>} A promise resolving to an array of storage items matching the query.
     */
    take: (search: string, total: number, methodName: string, storageName: StorageName, score?: number) => Promise<IStorageData[]>;
    /**
     * Upserts (inserts or updates) an item in the shared storage identified by storageName.
     * Wraps SharedStorageConnectionService.upsert with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., storing data in EXECUTE_FN) and PerfService (e.g., tracking storage updates in sessionState).
     * @param {IStorageData} item - The storage item to upsert, sourced from Storage.interface (e.g., with id, data fields).
     * @param {string} methodName - The method name for context and logging.
     * @param {StorageName} storageName - The name of the shared storage, used in DocService documentation.
     * @returns {Promise<void>} A promise resolving when the item is upserted.
     */
    upsert: (item: IStorageData, methodName: string, storageName: StorageName) => Promise<void>;
    /**
     * Removes an item from the shared storage identified by storageName, using the item’s ID.
     * Wraps SharedStorageConnectionService.remove with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., deleting data in EXECUTE_FN) and PerfService (e.g., tracking storage cleanup).
     * @param {IStorageData["id"]} itemId - The ID of the item to remove, sourced from Storage.interface.
     * @param {string} methodName - The method name for context and logging.
     * @param {StorageName} storageName - The name of the shared storage, used in DocService documentation.
     * @returns {Promise<void>} A promise resolving when the item is removed.
     */
    remove: (itemId: IStorageData["id"], methodName: string, storageName: StorageName) => Promise<void>;
    /**
     * Retrieves a specific item from the shared storage identified by storageName, using the item’s ID.
     * Wraps SharedStorageConnectionService.get with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., fetching data in EXECUTE_FN) and PerfService (e.g., reading storage for metrics).
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve, sourced from Storage.interface.
     * @param {string} methodName - The method name for context and logging.
     * @param {StorageName} storageName - The name of the shared storage, used in DocService documentation.
     * @returns {Promise<IStorageData | null>} A promise resolving to the retrieved item or null if not found.
     */
    get: (itemId: IStorageData["id"], methodName: string, storageName: StorageName) => Promise<IStorageData | null>;
    /**
     * Retrieves a list of all items from the shared storage identified by storageName, optionally filtered by a predicate function.
     * Wraps SharedStorageConnectionService.list with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., listing storage in EXECUTE_FN) and DocService (e.g., documenting storage contents).
     * @param {string} methodName - The method name for context and logging.
     * @param {StorageName} storageName - The name of the shared storage, used in DocService documentation.
     * @param {(item: IStorageData) => boolean} [filter] - An optional predicate function to filter items.
     * @returns {Promise<IStorageData[]>} A promise resolving to an array of storage items.
     */
    list: (methodName: string, storageName: StorageName, filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>;
    /**
     * Clears all items from the shared storage identified by storageName.
     * Wraps SharedStorageConnectionService.clear with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., resetting storage in EXECUTE_FN) and PerfService (e.g., clearing storage for performance resets).
     * @param {string} methodName - The method name for context and logging.
     * @param {StorageName} storageName - The name of the shared storage, used in DocService documentation.
     * @returns {Promise<void>} A promise resolving when the storage is cleared.
     */
    clear: (methodName: string, storageName: StorageName) => Promise<void>;
}

/**
 * Service class for managing in-memory data for different sessions in the swarm system.
 * Provides a simple key-value store using a Map, associating SessionId (as clientId) with arbitrary objects, with methods to write, read, and dispose of session-specific memory data.
 * Integrates with SessionConnectionService (session-specific memory management), ClientAgent (potential runtime memory for agents), PerfService (tracking via logging), and SessionPublicService (public session API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during write, read, and dispose operations.
 * Acts as a lightweight, non-persistent memory layer for session-scoped data, distinct from StateConnectionService or StorageConnectionService, with no schema validation or persistence.
 */
declare class MemorySchemaService {
    /**
     * Logger service instance, injected via DI, for logging memory operations.
     * Used in writeValue, readValue, and dispose methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionConnectionService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Map instance for storing session-specific memory data.
     * Maps SessionId (as clientId) to arbitrary objects, providing a simple in-memory store, used in writeValue, readValue, and dispose methods.
     * Not persisted, serving as a transient memory layer for session runtime data.
     * @type {Map<SessionId, object>}
     * @private
     */
    private memoryMap;
    /**
     * Writes a value to the memory map for a given client ID, merging it with existing data.
     * Merges the provided value with any existing object for the clientId using Object.assign, then stores the result in the memoryMap, returning the merged value.
     * Logs the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SessionConnectionService’s session data needs.
     * Supports ClientAgent by providing a flexible, session-scoped memory store for runtime data.
     * @template T - The type of the value to be written, extending object, defaulting to a generic object.
     * @param {string} clientId - The ID of the client, typed as SessionId from Session.interface, scoping the memory to a session.
     * @param {T} value - The value to write, merged with existing data if present.
     * @returns {T} The merged value stored in the memory map, reflecting the updated session data.
     */
    writeValue: <T extends object = object>(clientId: string, value: T) => T;
    /**
     * Reads a value from the memory map for a given client ID, returning an empty object if not found.
     * Retrieves the stored object for the clientId from the memoryMap, defaulting to an empty object if no entry exists, cast to the generic type T.
     * Logs the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SessionPublicService’s data access needs.
     * Supports ClientAgent by providing access to session-scoped runtime memory.
     * @template T - The type of the value to be read, extending object, defaulting to a generic object.
     * @param {string} clientId - The ID of the client, typed as SessionId from Session.interface, scoping the memory to a session.
     * @returns {T} The value associated with the clientId, or an empty object if none exists, cast to type T.
     */
    readValue: <T extends object = object>(clientId: string) => T;
    /**
     * Disposes of the memory map entry for a given client ID, removing it from storage.
     * Deletes the entry associated with the clientId from the memoryMap, effectively clearing session-specific data.
     * Logs the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SessionConnectionService’s cleanup needs.
     * Supports session termination or reset scenarios in SessionPublicService and ClientAgent workflows.
     * @param {string} clientId - The ID of the client, typed as SessionId from Session.interface, scoping the memory to a session.
     */
    dispose: (clientId: string) => void;
}

/**
 * Interface representing a performance record for a process within the swarm system.
 * Aggregates execution and response metrics across multiple clients (e.g., sessions or agent instances) for a specific process, likely used for system-wide performance monitoring or diagnostics.
 * Integrated into components like logging (e.g., ILogger in ClientAgent) or event buses (e.g., IBus.emit) to track operational efficiency, such as total execution counts, response times, and temporal context.
 */
interface IPerformanceRecord {
    /**
     * The unique identifier of the process being monitored.
     * Represents a specific execution context, such as a swarm run, agent workflow, or session batch, distinguishing it from other processes in the system.
     * Example: A UUID or incremental ID like "proc-123" tied to a ClientAgent execution cycle.
     * @type {string}
     */
    processId: string;
    /**
     * Array of performance records for individual clients involved in the process.
     * Each entry details metrics for a specific client (e.g., a session or agent instance), enabling granular analysis of performance across the swarm.
     * Populated with IClientPerfomanceRecord objects, reflecting per-client execution and resource usage.
     * @type {IClientPerfomanceRecord[]}
     */
    clients: IClientPerfomanceRecord[];
    /**
     * The total number of executions performed across all clients in the process.
     * Counts discrete operations (e.g., command executions in ClientAgent.execute, tool calls), providing a measure of overall activity volume.
     * Example: 50 if 5 clients each executed 10 commands.
     * @type {number}
     */
    totalExecutionCount: number;
    /**
     * The total response time for the process, formatted as a string.
     * Represents the cumulative duration of all client responses (e.g., from command start to output in ClientAgent), typically in a human-readable format like "500ms" or "1.23s".
     * Useful for assessing end-to-end performance across the process.
     * @type {string}
     */
    totalResponseTime: string;
    /**
     * The average response time per execution across all clients, formatted as a string.
     * Calculated as totalResponseTime divided by totalExecutionCount, providing a normalized performance metric (e.g., "10ms" per execution).
     * Aids in identifying typical response latency for the process.
     * @type {string}
     */
    averageResponseTime: string;
    /**
     * The number of days since January 1, 1970 (Unix epoch), based on London time (UTC).
     * Serves as a coarse timestamp for when the performance record was created, aligning with historical date tracking conventions.
     * Example: 19737 for a date in 2024, calculated as floor(Date.now() / 86400000).
     * @type {number}
     */
    momentStamp: number;
    /**
     * The number of seconds since midnight (00:00 UTC) of the day specified by momentStamp.
     * Provides fine-grained timing within the day, complementing momentStamp for precise event logging.
     * Example: 3600 for 01:00:00 UTC, derived from (Date.now() % 86400000) / 1000.
     * @type {number}
     */
    timeStamp: number;
    /**
     * The current date and time of the performance record in UTC format.
     * Stored as a string (e.g., "2024-03-15T12:00:00Z"), offering a human-readable timestamp for when the metrics were captured.
     * Likely used for logging or reporting alongside momentStamp and timeStamp.
     * @type {string}
     */
    date: string;
}
/**
 * Interface representing a performance record for an individual client within a process.
 * Captures detailed execution metrics, memory, and state for a specific client (e.g., a session or agent instance), used to analyze performance at the client level.
 * Embedded within IPerformanceRecord.clients to provide per-client breakdowns, likely logged via ILogger or emitted via IBus for monitoring (e.g., in ClientAgent workflows).
 */
interface IClientPerfomanceRecord {
    /**
     * The unique identifier of the client, typically a session or agent-specific ID.
     * Matches the clientId used in runtime params (e.g., this.params.clientId in ClientAgent), linking performance data to a specific session or agent instance.
     * Example: "client-456" for a user session.
     * @type {string}
     */
    clientId: string;
    /**
     * A key-value record of the client’s session memory.
     * Stores arbitrary data (e.g., cached values, temporary variables) used during the client’s operation, similar to IState’s state management in ClientAgent.
     * Example: `{ "cacheKey": "value" }` for a session’s temporary storage.
     * @type {Record<string, unknown>}
     */
    sessionMemory: Record<string, unknown>;
    /**
     * A key-value record of the client’s session state.
     * Represents persistent state data (e.g., configuration, current step) for the client, akin to IState’s role in tracking agent state in ClientAgent.
     * Example: `{ "step": 3, "active": true }` for a session’s current status.
     * @type {Record<string, unknown>}
     */
    sessionState: Record<string, unknown>;
    /**
     * The number of executions performed by this client within the process.
     * Counts operations like command runs (e.g., ClientAgent.execute) or tool calls, contributing to the process’s totalExecutionCount.
     * Example: 10 for a client that executed 10 commands.
     * @type {number}
     */
    executionCount: number;
    /**
     * The total input size processed during executions, in a numeric unit (e.g., bytes, characters).
     * Measures the cumulative input data (e.g., incoming messages in ClientAgent.execute), useful for assessing data throughput.
     * Example: 1024 for 1KB of total input across executions.
     * @type {number}
     */
    executionInputTotal: number;
    /**
     * The total output size generated during executions, in a numeric unit (e.g., bytes, characters).
     * Measures the cumulative output data (e.g., results in ClientAgent._emitOutput), indicating response volume.
     * Example: 2048 for 2KB of total output.
     * @type {number}
     */
    executionOutputTotal: number;
    /**
     * The average input size per execution, in a numeric unit (e.g., bytes, characters).
     * Calculated as executionInputTotal divided by executionCount, providing a normalized input metric.
     * Example: 102.4 for an average of 102.4 bytes per execution.
     * @type {number}
     */
    executionInputAverage: number;
    /**
     * The average output size per execution, in a numeric unit (e.g., bytes, characters).
     * Calculated as executionOutputTotal divided by executionCount, offering insight into typical output size.
     * Example: 204.8 for an average of 204.8 bytes per execution.
     * @type {number}
     */
    executionOutputAverage: number;
    /**
     * The total execution time for the client, formatted as a string.
     * Represents the cumulative duration of all executions (e.g., from incoming to output in ClientAgent.execute), typically in a readable format like "300ms" or "1.5s".
     * Contributes to the process’s totalResponseTime.
     * @type {string}
     */
    executionTimeTotal: string;
    /**
     * The average execution time per execution, formatted as a string.
     * Calculated as executionTimeTotal divided by executionCount, providing a normalized latency metric (e.g., "30ms" per execution).
     * Helps evaluate client-specific performance efficiency.
     * @type {string}
     */
    executionTimeAverage: string;
}

/**
 * Service class for tracking and logging performance metrics of client sessions in the swarm system.
 * Monitors execution times, input/output lengths, and session states, aggregating data into IPerformanceRecord and IClientPerfomanceRecord structures.
 * Integrates with ClientAgent workflows (e.g., execute, run) to measure performance, using LoggerService for logging (gated by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and validation/public services for state computation.
 * Provides methods to start/end executions, retrieve metrics, and serialize performance data for reporting or analytics.
 */
declare class PerfService {
    /**
     * Logger service instance for logging performance-related information, injected via DI.
     * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, used across methods (e.g., startExecution, toRecord) for info-level logging.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Session validation service instance, injected via DI.
     * Used to retrieve session lists (e.g., getActiveSessions) and swarm names (e.g., computeClientState).
     * @type {SessionValidationService}
     * @private
     */
    private readonly sessionValidationService;
    /**
     * Memory schema service instance, injected via DI.
     * Provides session memory data for toClientRecord, aligning with IClientPerfomanceRecord.sessionMemory.
     * @type {MemorySchemaService}
     * @private
     */
    private readonly memorySchemaService;
    /**
     * Swarm validation service instance, injected via DI.
     * Retrieves agent and policy lists for computeClientState, supporting swarm-level state aggregation.
     * @type {SwarmValidationService}
     * @private
     */
    private readonly swarmValidationService;
    /**
     * Agent validation service instance, injected via DI.
     * Fetches state lists for agents in computeClientState, enabling client state computation.
     * @type {AgentValidationService}
     * @private
     */
    private readonly agentValidationService;
    /**
     * State public service instance, injected via DI.
     * Retrieves state values for computeClientState, populating IClientPerfomanceRecord.sessionState.
     * @type {StatePublicService}
     * @private
     */
    private readonly statePublicService;
    /**
     * Swarm public service instance, injected via DI.
     * Provides agent names for computeClientState, supporting swarm status in sessionState.
     * @type {SwarmPublicService}
     * @private
     */
    private readonly swarmPublicService;
    /**
     * Policy public service instance, injected via DI.
     * Checks for bans in computeClientState, contributing to policyBans in sessionState.
     * @type {PolicyPublicService}
     * @private
     */
    private readonly policyPublicService;
    /**
     * State connection service instance, injected via DI.
     * Verifies state references in computeClientState, ensuring valid state retrieval.
     * @type {StateConnectionService}
     * @private
     */
    private readonly stateConnectionService;
    /**
     * Map tracking execution start times for clients, keyed by clientId and executionId.
     * Used in startExecution and endExecution to calculate response times per execution.
     * @type {Map<string, Map<string, number[]>>}
     * @private
     */
    private executionScheduleMap;
    /**
     * Map of total output lengths per client, keyed by clientId.
     * Updated in endExecution, used for IClientPerfomanceRecord.executionOutputTotal.
     * @type {Map<string, number>}
     * @private
     */
    private executionOutputLenMap;
    /**
     * Map of total input lengths per client, keyed by clientId.
     * Updated in startExecution, used for IClientPerfomanceRecord.executionInputTotal.
     * @type {Map<string, number>}
     * @private
     */
    private executionInputLenMap;
    /**
     * Map of execution counts per client, keyed by clientId.
     * Updated in startExecution, used for IClientPerfomanceRecord.executionCount.
     * @type {Map<string, number>}
     * @private
     */
    private executionCountMap;
    /**
     * Map of total execution times per client, keyed by clientId.
     * Updated in endExecution, used for IClientPerfomanceRecord.executionTimeTotal.
     * @type {Map<string, number>}
     * @private
     */
    private executionTimeMap;
    /**
     * Total response time across all executions, in milliseconds.
     * Aggregated in endExecution, used for IPerformanceRecord.totalResponseTime.
     * @type {number}
     * @private
     */
    private totalResponseTime;
    /**
     * Total number of execution requests across all clients.
     * Incremented in endExecution, used for IPerformanceRecord.totalExecutionCount.
     * @type {number}
     * @private
     */
    private totalRequestCount;
    /**
     * Computes the aggregated state of a client by collecting swarm, agent, policy, and state data.
     * Used in toClientRecord to populate IClientPerfomanceRecord.sessionState, integrating with validation and public services.
     * Logs via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true (e.g., ClientAgent-style debug logging).
     * @param {string} clientId - The unique identifier of the client.
     * @returns {Promise<Record<string, unknown>>} A promise resolving to an object with swarm status, policy bans, and state values.
     * @private
     */
    private computeClientState;
    /**
     * Retrieves the number of active executions for a client’s session.
     * Used to monitor execution frequency, reflecting IClientPerfomanceRecord.executionCount.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {number} The number of executions recorded for the client, or 0 if none.
     */
    getActiveSessionExecutionCount: (clientId: string) => number;
    /**
     * Retrieves the total execution time for a client’s sessions, in milliseconds.
     * Used for performance analysis, feeding into IClientPerfomanceRecord.executionTimeTotal.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {number} The total execution time in milliseconds, or 0 if none.
     */
    getActiveSessionExecutionTotalTime: (clientId: string) => number;
    /**
     * Calculates the average execution time per execution for a client’s sessions, in milliseconds.
     * Used for performance metrics, contributing to IClientPerfomanceRecord.executionTimeAverage.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {number} The average execution time in milliseconds, or 0 if no executions.
     */
    getActiveSessionExecutionAverageTime: (clientId: string) => number;
    /**
     * Calculates the average input length per execution for a client’s sessions.
     * Used for data throughput analysis, feeding into IClientPerfomanceRecord.executionInputAverage.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {number} The average input length (e.g., bytes, characters), or 0 if no executions.
     */
    getActiveSessionAverageInputLength: (clientId: string) => number;
    /**
     * Calculates the average output length per execution for a client’s sessions.
     * Used for data throughput analysis, feeding into IClientPerfomanceRecord.executionOutputAverage.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {number} The average output length (e.g., bytes, characters), or 0 if no executions.
     */
    getActiveSessionAverageOutputLength: (clientId: string) => number;
    /**
     * Retrieves the total input length for a client’s sessions.
     * Used for data volume tracking, aligning with IClientPerfomanceRecord.executionInputTotal.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {number} The total input length (e.g., bytes, characters), or 0 if none.
     */
    getActiveSessionTotalInputLength: (clientId: string) => number;
    /**
     * Retrieves the total output length for a client’s sessions.
     * Used for data volume tracking, aligning with IClientPerfomanceRecord.executionOutputTotal.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {number} The total output length (e.g., bytes, characters), or 0 if none.
     */
    getActiveSessionTotalOutputLength: (clientId: string) => number;
    /**
     * Retrieves the list of active session client IDs.
     * Sources data from sessionValidationService, used in toRecord to enumerate clients.
     * @returns {string[]} An array of client IDs with active sessions.
     */
    getActiveSessions: () => string[];
    /**
     * Calculates the average response time across all executions, in milliseconds.
     * Used for system-wide performance metrics, feeding into IPerformanceRecord.averageResponseTime.
     * @returns {number} The average response time in milliseconds, or 0 if no requests.
     */
    getAverageResponseTime: () => number;
    /**
     * Retrieves the total number of executions across all clients.
     * Used for system-wide metrics, aligning with IPerformanceRecord.totalExecutionCount.
     * @returns {number} The total execution count.
     */
    getTotalExecutionCount: () => number;
    /**
     * Retrieves the total response time across all executions, in milliseconds.
     * Used for system-wide metrics, feeding into IPerformanceRecord.totalResponseTime.
     * @returns {number} The total response time in milliseconds.
     */
    getTotalResponseTime: () => number;
    /**
     * Starts tracking an execution for a client, recording start time and input length.
     * Initializes maps and increments execution count/input length, used with endExecution to measure performance (e.g., ClientAgent.execute).
     * @param {string} executionId - The unique identifier of the execution (e.g., a command or tool call).
     * @param {string} clientId - The unique identifier of the client.
     * @param {number} inputLen - The length of the input data (e.g., bytes, characters).
     * @returns {void}
     */
    startExecution: (executionId: string, clientId: string, inputLen: number) => void;
    /**
     * Ends tracking an execution for a client, calculating response time and updating output length.
     * Pairs with startExecution to compute execution duration, updating totals for IClientPerfomanceRecord metrics.
     * @param {string} executionId - The unique identifier of the execution.
     * @param {string} clientId - The unique identifier of the client.
     * @param {number} outputLen - The length of the output data (e.g., bytes, characters).
     * @returns {boolean} True if the execution was successfully ended (start time found), false otherwise.
     */
    endExecution: (executionId: string, clientId: string, outputLen: number) => boolean;
    /**
     * Serializes performance metrics for a specific client into an IClientPerfomanceRecord.
     * Aggregates execution counts, input/output lengths, times, memory, and state, used in toRecord for per-client data.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {Promise<IClientPerfomanceRecord>} A promise resolving to the client’s performance record.
     */
    toClientRecord: (clientId: string) => Promise<IClientPerfomanceRecord>;
    /**
     * Serializes performance metrics for all clients into an IPerformanceRecord.
     * Aggregates client records, total execution counts, and response times, used for system-wide performance reporting.
     * @returns {Promise<IPerformanceRecord>} A promise resolving to the complete performance record.
     */
    toRecord: () => Promise<IPerformanceRecord>;
    /**
     * Disposes of all performance data associated with a client.
     * Clears maps for the clientId, used to reset or terminate tracking (e.g., session end in ClientAgent).
     * @param {string} clientId - The unique identifier of the client.
     * @returns {void}
     */
    dispose: (clientId: string) => void;
}

/**
 * Service class for managing policy schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IPolicySchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with PolicyConnectionService (policy enforcement via getBannedClients), ClientAgent (policy application during execution), SessionConnectionService (session-level policy checks), and PolicyPublicService (public policy API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining policy logic (e.g., getBannedClients function) to manage access control and restrictions within the swarm ecosystem.
 */
declare class PolicySchemaService {
    /**
     * Logger service instance, injected via DI, for logging policy schema operations.
     * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with PolicyConnectionService and PerfService logging patterns.
     * @type {LoggerService}
     * @readonly
     */
    readonly loggerService: LoggerService;
    /**
     * Registry instance for storing policy schemas, initialized with ToolRegistry from functools-kit.
     * Maps PolicyName keys to IPolicySchema values, providing efficient storage and retrieval, used in register and get methods.
     * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
     * @type {ToolRegistry<Record<PolicyName, IPolicySchema>>}
     * @private
     */
    private registry;
    /**
     * Validates a policy schema shallowly, ensuring required fields meet basic integrity constraints.
     * Checks policyName as a string and getBannedClients as a function, critical for policy enforcement in PolicyConnectionService.
     * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with PolicyConnectionService’s needs.
     * Supports ClientAgent and SessionConnectionService by ensuring policy schema validity before registration.
     * @param {IPolicySchema} policySchema - The policy schema to validate, sourced from Policy.interface.
     * @throws {Error} If any validation check fails, with detailed messages including policyName.
     * @private
     */
    private validateShallow;
    /**
     * Registers a new policy schema in the registry after validation.
     * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (policyName).
     * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with PolicyConnectionService’s policy enforcement.
     * Supports ClientAgent execution and SessionConnectionService by providing validated policy schemas for access control.
     * @param {PolicyName} key - The name of the policy, used as the registry key, sourced from Policy.interface.
     * @param {IPolicySchema} value - The policy schema to register, sourced from Policy.interface, validated before storage.
     * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
     */
    register: (key: PolicyName, value: IPolicySchema) => void;
    /**
     * Retrieves a policy schema from the registry by its name.
     * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports PolicyConnectionService’s getBannedClients method by providing policy logic, used in ClientAgent execution and SessionConnectionService session management.
     * @param {PolicyName} key - The name of the policy to retrieve, sourced from Policy.interface.
     * @returns {IPolicySchema} The policy schema associated with the key, sourced from Policy.interface, including the getBannedClients function.
     * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
     */
    get: (key: PolicyName) => IPolicySchema;
}

/**
 * Service for validating policies within the swarm system.
 * Manages a map of registered policies, ensuring their uniqueness and existence during validation.
 * Integrates with PolicySchemaService (policy registration), ClientPolicy (policy enforcement),
 * AgentValidationService (potential policy validation for agents), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
 */
declare class PolicyValidationService {
    /**
     * Logger service instance for logging validation operations and errors.
     * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
     * @type {LoggerService}
     * @private
     * @readonly
     */
    private readonly loggerService;
    /**
     * Map of policy names to their schemas, used to track and validate policies.
     * Populated by addPolicy, queried by validate.
     * @type {Map<PolicyName, IPolicySchema>}
     * @private
     */
    private _policyMap;
    /**
     * Registers a new policy with its schema in the validation service.
     * Logs the operation and ensures uniqueness, supporting PolicySchemaService’s registration process.
     * @param {PolicyName} policyName - The name of the policy to add, sourced from Policy.interface.
     * @param {IPolicySchema} policySchema - The schema defining the policy’s configuration, sourced from Policy.interface.
     * @throws {Error} If the policy name already exists in _policyMap.
     */
    addPolicy: (policyName: PolicyName, policySchema: IPolicySchema) => void;
    /**
     * Validates if a policy name exists in the registered map, memoized by policyName for performance.
     * Logs the operation and checks existence, supporting ClientPolicy’s policy enforcement validation.
     * @param {PolicyName} policyName - The name of the policy to validate, sourced from Policy.interface.
     * @param {string} source - The source of the validation request (e.g., "agent-validate"), for error context.
     * @throws {Error} If the policy name is not found in _policyMap.
     */
    validate: (policyName: PolicyName, source: string) => void;
}

declare const BAN_NEED_FETCH: unique symbol;
/**
 * Class representing a client policy in the swarm system, implementing the IPolicy interface.
 * Manages client bans, input/output validation, and restrictions, with lazy-loaded ban lists and event emission via BusService.
 * Integrates with PolicyConnectionService (policy instantiation), SwarmConnectionService (swarm-level restrictions via SwarmSchemaService’s policies),
 * ClientAgent (message validation), and BusService (event emission).
 * Supports auto-banning on validation failure and customizable ban messages, ensuring swarm security and compliance.
 * @implements {IPolicy}
 */
declare class ClientPolicy implements IPolicy {
    readonly params: IPolicyParams;
    /**
     * Set of banned client IDs or a symbol indicating the ban list needs to be fetched.
     * Initialized as BAN_NEED_FETCH, lazily populated via params.getBannedClients on first use in hasBan, validateInput, etc.
     * Updated by banClient and unbanClient, persisted if params.setBannedClients is provided.
     * @type {Set<SessionId> | typeof BAN_NEED_FETCH}
     */
    _banSet: Set<SessionId> | typeof BAN_NEED_FETCH;
    /**
     * Constructs a ClientPolicy instance with the provided parameters.
     * Invokes the onInit callback if defined and logs construction if debugging is enabled.
     * @param {IPolicyParams} params - The parameters for initializing the policy, including policyName, getBannedClients, validateInput, etc.
     */
    constructor(params: IPolicyParams);
    /**
     * Checks if a client is banned for a specific swarm, lazily fetching the ban list if not already loaded.
     * Used by SwarmConnectionService to enforce swarm-level restrictions defined in SwarmSchemaService’s policies.
     * @param {SessionId} clientId - The ID of the client to check, sourced from Session.interface.
     * @param {SwarmName} swarmName - The name of the swarm to check against, sourced from Swarm.interface.
     * @returns {Promise<boolean>} True if the client is banned for the swarm, false otherwise.
     */
    hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Retrieves the ban message for a client, using a custom getBanMessage function if provided or falling back to params.banMessage.
     * Supports ClientAgent by providing ban feedback when validation fails, enhancing user experience.
     * @param {SessionId} clientId - The ID of the client to get the ban message for, sourced from Session.interface.
     * @param {SwarmName} swarmName - The name of the swarm to check against, sourced from Swarm.interface.
     * @returns {Promise<string>} The ban message for the client, either custom or default.
     */
    getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;
    /**
     * Validates an incoming message from a client, checking ban status and applying custom validation if provided.
     * Auto-bans the client via banClient if validation fails and params.autoBan is true, emitting events via BusService.
     * Used by ClientAgent to filter incoming messages before processing, ensuring policy compliance.
     * @param {string} incoming - The incoming message to validate, typically from a user or tool.
     * @param {SessionId} clientId - The ID of the client sending the message, sourced from Session.interface.
     * @param {SwarmName} swarmName - The name of the swarm to validate against, sourced from Swarm.interface.
     * @returns {Promise<boolean>} True if the input is valid and the client is not banned, false otherwise.
     */
    validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Validates an outgoing message to a client, checking ban status and applying custom validation if provided.
     * Auto-bans the client via banClient if validation fails and params.autoBan is true, emitting events via BusService.
     * Used by ClientAgent to ensure outgoing messages comply with swarm policies before emission.
     * @param {string} outgoing - The outgoing message to validate, typically an agent response or tool output.
     * @param {SessionId} clientId - The ID of the client receiving the message, sourced from Session.interface.
     * @param {SwarmName} swarmName - The name of the swarm to validate against, sourced from Swarm.interface.
     * @returns {Promise<boolean>} True if the output is valid and the client is not banned, false otherwise.
     */
    validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Bans a client, adding them to the ban set and persisting the change if params.setBannedClients is provided.
     * Emits a ban event via BusService and invokes the onBanClient callback, supporting SwarmConnectionService’s access control.
     * Skips if the client is already banned to avoid redundant updates.
     * @param {SessionId} clientId - The ID of the client to ban, sourced from Session.interface.
     * @param {SwarmName} swarmName - The name of the swarm to ban the client from, sourced from Swarm.interface.
     * @returns {Promise<void>} Resolves when the client is banned and the event is emitted.
     */
    banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
    /**
     * Unbans a client, removing them from the ban set and persisting the change if params.setBannedClients is provided.
     * Emits an unban event via BusService and invokes the onUnbanClient callback, supporting dynamic policy adjustments.
     * Skips if the client is not banned to avoid redundant updates.
     * @param {SessionId} clientId - The ID of the client to unban, sourced from Session.interface.
     * @param {SwarmName} swarmName - The name of the swarm to unban the client from, sourced from Swarm.interface.
     * @returns {Promise<void>} Resolves when the client is unbanned and the event is emitted.
     */
    unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
}

/**
 * Service class for managing policy connections and operations in the swarm system.
 * Implements IPolicy to provide an interface for policy instance management, ban status checks, input/output validation, and ban management, scoped to policyName, clientId, and swarmName.
 * Integrates with ClientAgent (policy enforcement in EXECUTE_FN), SessionPublicService (session-level policy enforcement), PolicyPublicService (public policy API), SwarmPublicService (swarm context), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientPolicy instances by policyName, ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with PolicySchemaService for policy configuration and BusService for event emission.
 * @implements {IPolicy}
 */
declare class PolicyConnectionService implements IPolicy {
    /**
     * Logger service instance, injected via DI, for logging policy operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with PolicyPublicService and PerfService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Bus service instance, injected via DI, for emitting policy-related events.
     * Passed to ClientPolicy for event propagation (e.g., ban updates), aligning with BusService’s event system in SessionPublicService.
     * @type {BusService}
     * @private
     */
    private readonly busService;
    /**
     * Method context service instance, injected via DI, for accessing execution context.
     * Used to retrieve policyName in method calls, integrating with MethodContextService’s scoping in PolicyPublicService.
     * @type {TMethodContextService}
     * @private
     */
    private readonly methodContextService;
    /**
     * Policy schema service instance, injected via DI, for retrieving policy configurations.
     * Provides policy details (e.g., autoBan, schema) in getPolicy, aligning with DocService’s policy documentation.
     * @type {PolicySchemaService}
     * @private
     */
    private readonly policySchemaService;
    /**
     * Retrieves or creates a memoized ClientPolicy instance for a given policy name.
     * Uses functools-kit’s memoize to cache instances by policyName, ensuring efficient reuse across calls.
     * Configures the policy with schema data from PolicySchemaService, defaulting autoBan to GLOBAL_CONFIG.CC_AUTOBAN_ENABLED_BY_DEFAULT if not specified.
     * Supports ClientAgent (policy enforcement), SessionPublicService (session policies), and PolicyPublicService (public API).
     * @param {PolicyName} policyName - The name of the policy, sourced from Policy.interface, used in PolicySchemaService lookups.
     * @returns {ClientPolicy} The memoized ClientPolicy instance configured for the policy.
     */
    getPolicy: ((policyName: PolicyName) => ClientPolicy) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientPolicy>;
    /**
     * Checks if a client has a ban flag in a specific swarm.
     * Delegates to ClientPolicy.hasBan, using context from MethodContextService to identify the policy, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors PolicyPublicService’s hasBan, supporting ClientAgent’s execution restrictions and SessionPublicService’s policy enforcement.
     * @param {SessionId} clientId - The ID of the client (session), scoping the check to a specific client, tied to Session.interface.
     * @param {SwarmName} swarmName - The name of the swarm, scoping the check to a specific swarm, sourced from Swarm.interface.
     * @returns {Promise<boolean>} A promise resolving to true if the client is banned in the swarm, false otherwise.
     */
    hasBan: (clientId: SessionId, swarmName: SwarmName) => Promise<boolean>;
    /**
     * Retrieves the ban message for a client in a specific swarm.
     * Delegates to ClientPolicy.getBanMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors PolicyPublicService’s getBanMessage, supporting ClientAgent’s ban feedback and SessionPublicService’s policy reporting.
     * @param {SessionId} clientId - The ID of the client (session), scoping the retrieval to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, scoping the retrieval to a specific swarm.
     * @returns {Promise<string>} A promise resolving to the ban message for the client in the swarm.
     */
    getBanMessage: (clientId: SessionId, swarmName: SwarmName) => Promise<string>;
    /**
     * Validates incoming input for a client in a specific swarm against the policy.
     * Delegates to ClientPolicy.validateInput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors PolicyPublicService’s validateInput, supporting ClientAgent’s input validation (e.g., in EXECUTE_FN) and SessionPublicService’s policy checks.
     * @param {string} incoming - The incoming input to validate.
     * @param {SessionId} clientId - The ID of the client (session), scoping the validation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, scoping the validation to a specific swarm.
     * @returns {Promise<boolean>} A promise resolving to true if the input is valid, false otherwise.
     */
    validateInput: (incoming: string, clientId: SessionId, swarmName: SwarmName) => Promise<boolean>;
    /**
     * Validates outgoing output for a client in a specific swarm against the policy.
     * Delegates to ClientPolicy.validateOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors PolicyPublicService’s validateOutput, supporting ClientAgent’s output validation (e.g., in EXECUTE_FN) and SessionPublicService’s policy checks.
     * @param {string} outgoing - The outgoing output to validate.
     * @param {SessionId} clientId - The ID of the client (session), scoping the validation to a specific client.
     * @param {SwarmName} swarmName - The name of the swarm, scoping the validation to a specific swarm.
     * @returns {Promise<boolean>} A promise resolving to true if the output is valid, false otherwise.
     */
    validateOutput: (outgoing: string, clientId: SessionId, swarmName: SwarmName) => Promise<boolean>;
    /**
     * Bans a client from a specific swarm based on the policy.
     * Delegates to ClientPolicy.banClient, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors PolicyPublicService’s banClient, supporting ClientAgent’s ban enforcement and SessionPublicService’s policy actions.
     * @param {SessionId} clientId - The ID of the client (session) to ban.
     * @param {SwarmName} swarmName - The name of the swarm from which to ban the client.
     * @returns {Promise<void>} A promise resolving when the client is banned.
     */
    banClient: (clientId: SessionId, swarmName: SwarmName) => Promise<void>;
    /**
     * Unbans a client from a specific swarm based on the policy.
     * Delegates to ClientPolicy.unbanClient, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Mirrors PolicyPublicService’s unbanClient, supporting ClientAgent’s ban reversal and SessionPublicService’s policy actions.
     * @param {SessionId} clientId - The ID of the client (session) to unban.
     * @param {SwarmName} swarmName - The name of the swarm from which to unban the client.
     * @returns {Promise<void>} A promise resolving when the client is unbanned.
     */
    unbanClient: (clientId: SessionId, swarmName: SwarmName) => Promise<void>;
}

/**
 * Interface extending PolicyConnectionService for type definition purposes.
 * Used to define TPolicyConnectionService by excluding internal keys, ensuring PolicyPublicService aligns with public-facing operations.
 * @interface IPolicyConnectionService
 */
interface IPolicyConnectionService extends PolicyConnectionService {
}
/**
 * Type representing keys to exclude from IPolicyConnectionService (internal methods).
 * Used to filter out non-public methods like getPolicy in TPolicyConnectionService.
 * @typedef {keyof { getPolicy: never }} InternalKeys
 */
type InternalKeys = keyof {
    getPolicy: never;
};
/**
 * Type representing the public interface of PolicyPublicService, derived from IPolicyConnectionService.
 * Excludes internal methods (e.g., getPolicy) via InternalKeys, ensuring a consistent public API for policy operations.
 * @typedef {Object} TPolicyConnectionService
 */
type TPolicyConnectionService = {
    [key in Exclude<keyof IPolicyConnectionService, InternalKeys>]: unknown;
};
/**
 * Service class for managing public policy operations in the swarm system.
 * Implements TPolicyConnectionService to provide a public API for policy-related interactions, delegating to PolicyConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with PerfService (e.g., policyBans in computeClientState), ClientAgent (e.g., input/output validation in EXECUTE_FN), DocService (e.g., policy documentation via policyName), and SwarmMetaService (e.g., swarm context via swarmName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like ban checking, validation, and client ban management.
 */
declare class PolicyPublicService implements TPolicyConnectionService {
    /**
     * Logger service instance, injected via DI, for logging policy operations.
     * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentPublicService and DocService logging patterns.
     * @type {LoggerService}
     * @private
     */
    private readonly loggerService;
    /**
     * Policy connection service instance, injected via DI, for underlying policy operations.
     * Provides core functionality (e.g., hasBan, validateInput) called by public methods, aligning with PerfService’s policy enforcement.
     * @type {PolicyConnectionService}
     * @private
     */
    private readonly policyConnectionService;
    /**
     * Checks if a client is banned from a specific swarm under a given policy.
     * Wraps PolicyConnectionService.hasBan with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in PerfService (e.g., policyBans in computeClientState) and ClientAgent (e.g., pre-execution ban checks in EXECUTE_FN).
     * @param {SwarmName} swarmName - The name of the swarm, sourced from Swarm.interface, tying to SwarmMetaService.
     * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
     * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking.
     * @param {PolicyName} policyName - The name of the policy, sourced from Policy.interface, used in DocService docs.
     * @returns {Promise<boolean>} A promise resolving to true if the client is banned, false otherwise.
     */
    hasBan: (swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<boolean>;
    /**
     * Retrieves the ban message for a client in a specific swarm under a given policy.
     * Wraps PolicyConnectionService.getBanMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., displaying ban reasons in EXECUTE_FN) and PerfService (e.g., policyBans logging).
     * @param {SwarmName} swarmName - The name of the swarm, tying to SwarmMetaService context.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {PolicyName} policyName - The policy name for identification and documentation.
     * @returns {Promise<string>} A promise resolving to the ban message string.
     */
    getBanMessage: (swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<string>;
    /**
     * Validates incoming data against a specific policy for a client in a swarm.
     * Wraps PolicyConnectionService.validateInput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in ClientAgent (e.g., input validation in EXECUTE_FN) and PerfService (e.g., policy enforcement in computeClientState).
     * @param {string} incoming - The incoming data to validate (e.g., user input).
     * @param {SwarmName} swarmName - The name of the swarm for context.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {PolicyName} policyName - The policy name for identification.
     * @returns {Promise<boolean>} A promise resolving to true if the input is valid, false otherwise.
     */
    validateInput: (incoming: string, swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<boolean>;
    /**
     * Validates outgoing data against a specific policy for a client in a swarm.
     * Wraps PolicyConnectionService.validateOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports ClientAgent (e.g., output validation in EXECUTE_FN) and DocService (e.g., documenting policy-compliant outputs).
     * @param {string} outgoing - The outgoing data to validate (e.g., agent response).
     * @param {SwarmName} swarmName - The name of the swarm for context.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID for session tracking.
     * @param {PolicyName} policyName - The policy name for identification.
     * @returns {Promise<boolean>} A promise resolving to true if the output is valid, false otherwise.
     */
    validateOutput: (outgoing: string, swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<boolean>;
    /**
     * Bans a client from a specific swarm under a given policy.
     * Wraps PolicyConnectionService.banClient with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Used in PerfService (e.g., enforcing policyBans in computeClientState) and ClientAgent (e.g., restricting access).
     * @param {SwarmName} swarmName - The name of the swarm to ban the client from.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID to ban.
     * @param {PolicyName} policyName - The policy name enforcing the ban.
     * @returns {Promise<void>} A promise resolving when the client is banned.
     */
    banClient: (swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<void>;
    /**
     * Unbans a client from a specific swarm under a given policy.
     * Wraps PolicyConnectionService.unbanClient with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
     * Supports PerfService (e.g., reversing policyBans) and ClientAgent (e.g., restoring access).
     * @param {SwarmName} swarmName - The name of the swarm to unban the client from.
     * @param {string} methodName - The method name for context and logging.
     * @param {string} clientId - The client ID to unban.
     * @param {PolicyName} policyName - The policy name lifting the ban.
     * @returns {Promise<void>} A promise resolving when the client is unbanned.
     */
    unbanClient: (swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<void>;
}

/**
 * Service class for managing the online/offline status of clients within swarms.
 * Provides methods to mark clients as online or offline, leveraging persistent storage via `PersistAliveAdapter`.
 */
declare class AliveService {
    /** @private Injected logger service for logging operations within the AliveService */
    private readonly loggerService;
    /**
     * Marks a client as online within a specific swarm and logs the action.
     * Persists the online status using `PersistAliveAdapter` if persistence is enabled in the global configuration.
     * @param {SessionId} clientId - The unique identifier of the client session, a string (e.g., "session123") representing a user session in the swarm system.
     *                               Used to track the specific client’s online status within a `SwarmName`.
     * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
     *                                Defines the context in which the client’s online status is managed and persisted.
     * @param {string} methodName - The name of the calling method (e.g., "someMethod"), used for logging purposes to trace the origin of the call.
     * @returns {Promise<void>} A promise that resolves when the online status is marked and persisted (if enabled).
     */
    markOnline: (clientId: SessionId, swarmName: SwarmName, methodName: string) => Promise<void>;
    /**
     * Marks a client as offline within a specific swarm and logs the action.
     * Persists the offline status using `PersistAliveAdapter` if persistence is enabled in the global configuration.
     * @param {SessionId} clientId - The unique identifier of the client session, a string (e.g., "session123") representing a user session in the swarm system.
     *                               Used to track the specific client’s offline status within a `SwarmName`.
     * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
     *                                Defines the context in which the client’s offline status is managed and persisted.
     * @param {string} methodName - The name of the calling method (e.g., "someMethod"), used for logging purposes to trace the origin of the call.
     * @returns {Promise<void>} A promise that resolves when the offline status is marked and persisted (if enabled).
     */
    markOffline: (clientId: SessionId, swarmName: SwarmName, methodName: string) => Promise<void>;
}

declare const swarm: {
    agentValidationService: AgentValidationService;
    toolValidationService: ToolValidationService;
    sessionValidationService: SessionValidationService;
    swarmValidationService: SwarmValidationService;
    completionValidationService: CompletionValidationService;
    storageValidationService: StorageValidationService;
    embeddingValidationService: EmbeddingValidationService;
    policyValidationService: PolicyValidationService;
    agentMetaService: AgentMetaService;
    swarmMetaService: SwarmMetaService;
    agentPublicService: AgentPublicService;
    historyPublicService: HistoryPublicService;
    sessionPublicService: SessionPublicService;
    swarmPublicService: SwarmPublicService;
    storagePublicService: StoragePublicService;
    sharedStoragePublicService: SharedStoragePublicService;
    statePublicService: StatePublicService<any>;
    sharedStatePublicService: SharedStatePublicService<any>;
    policyPublicService: PolicyPublicService;
    agentSchemaService: AgentSchemaService;
    toolSchemaService: ToolSchemaService;
    swarmSchemaService: SwarmSchemaService;
    completionSchemaService: CompletionSchemaService;
    embeddingSchemaService: EmbeddingSchemaService;
    storageSchemaService: StorageSchemaService;
    stateSchemaService: StateSchemaService;
    memorySchemaService: MemorySchemaService;
    policySchemaService: PolicySchemaService;
    agentConnectionService: AgentConnectionService;
    historyConnectionService: HistoryConnectionService;
    swarmConnectionService: SwarmConnectionService;
    sessionConnectionService: SessionConnectionService;
    storageConnectionService: StorageConnectionService;
    sharedStorageConnectionService: SharedStorageConnectionService;
    stateConnectionService: StateConnectionService<any>;
    sharedStateConnectionService: SharedStateConnectionService<any>;
    policyConnectionService: PolicyConnectionService;
    methodContextService: {
        readonly context: IMethodContext;
    };
    payloadContextService: {
        readonly context: IPayloadContext;
    };
    executionContextService: {
        readonly context: IExecutionContext;
    };
    docService: DocService;
    busService: BusService;
    perfService: PerfService;
    aliveService: AliveService;
    loggerService: LoggerService;
};

/**
 * Dumps the documentation for the agents and swarms.
 *
 * @param {string} [dirName="./docs/chat"] - The directory where the documentation will be dumped.
 * @param {function} [PlantUML] - An optional function to process PlantUML diagrams.
 * @returns {Promise<void>} - A promise that resolves when the documentation has been dumped.
 */
declare const dumpDocs: (dirName?: any, PlantUML?: (uml: string) => Promise<string>) => Promise<void>;

/**
 * The config for UML generation
 */
interface IConfig {
    withSubtree: boolean;
}
/**
 * Dumps the agent information into PlantUML format.
 *
 * @param {SwarmName} swarmName - The name of the swarm to be dumped.
 * @returns {string} The UML representation of the swarm.
 */
declare const dumpAgent: (agentName: string, args_1?: Partial<IConfig>) => string;

/**
 * Dumps the swarm information into PlantUML format.
 *
 * @param {SwarmName} swarmName - The name of the swarm to be dumped.
 * @returns {string} The UML representation of the swarm.
 */
declare const dumpSwarm: (swarmName: string) => string;

/**
 * Dumps the performance data using the swarm's document service.
 * Logs the method name if logging is enabled in the global configuration.
 *
 * @param {string} [dirName="./logs/meta"] - The directory name where the performance data will be dumped.
 * @returns {Promise<void>} A promise that resolves when the performance data has been dumped.
 */
declare const dumpPerfomance: {
    (dirName?: string): Promise<void>;
    /**
     * Runs the dumpPerfomance function at specified intervals.
     * Logs the method name if logging is enabled in the global configuration.
     *
     * @param {string} [dirName="./logs/meta"] - The directory name where the performance data will be dumped.
     * @param {number} [interval=30000] - The interval in milliseconds at which to run the dumpPerfomance function.
     */
    runInterval: (dirName?: any, interval?: any) => () => void;
};

/**
 * Dumps the performance data using the swarm's document service.
 * Logs the method name if logging is enabled in the global configuration.
 *
 * @param {string} clientId - The client ID for which the performance data is being dumped.
 * @param {string} [dirName="./logs/client"] - The directory name where the performance data will be dumped.
 * @returns {Promise<void>} A promise that resolves when the performance data has been dumped.
 */
declare const dumpClientPerformance: {
    (clientId: string, dirName?: string): Promise<void>;
    /**
     * Sets up a listener to dump performance data after execution.
     * Logs the method name if logging is enabled in the global configuration.
     *
     * @param {string} [dirName="./logs/client"] - The directory name where the performance data will be dumped.
     * @returns {Promise<void>} A promise that resolves when the listener has been set up.
     */
    runAfterExecute: (dirName?: any) => Promise<() => void>;
};

/**
 * Adds a new agent to the agent registry for use within the swarm system.
 *
 * This function registers a new agent by adding it to the agent validation and schema services, making it available for swarm operations.
 * Only agents registered through this function can be utilized by the swarm. The execution is wrapped in `beginContext` to ensure it runs
 * outside of existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled
 * and returns the agent's name upon successful registration.
 *
 * @param {IAgentSchema} agentSchema - The schema defining the agent's properties, including its name (`agentName`) and other configuration details.
 * @returns {string} The name of the newly added agent (`agentSchema.agentName`), confirming its registration.
 * @throws {Error} If the agent schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate agent name).
 * @example
 * const agentSchema = { agentName: "AgentX", prompt: "Handle tasks" };
 * const agentName = addAgent(agentSchema);
 * console.log(agentName); // Outputs "AgentX"
 */
declare const addAgent: (agentSchema: IAgentSchema) => string;

/**
 * Adds a completion engine to the registry for use by agents in the swarm system.
 *
 * This function registers a completion engine, enabling agents to utilize various models and frameworks (e.g., mock, GPT4All, Ollama, OpenAI)
 * for generating completions. The completion schema is added to the validation and schema services, making it available for agent operations.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 * The function logs the operation if enabled and returns the completion's name upon successful registration.
 *
 * @param {ICompletionSchema} completionSchema - The schema defining the completion engine's properties, including its name (`completionName`) and configuration details.
 * @returns {string} The name of the newly added completion (`completionSchema.completionName`), confirming its registration.
 * @throws {Error} If the completion schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate completion name).
 * @example
 * const completionSchema = { completionName: "OpenAI", model: "gpt-3.5-turbo" };
 * const completionName = addCompletion(completionSchema);
 * console.log(completionName); // Outputs "OpenAI"
 */
declare const addCompletion: (completionSchema: ICompletionSchema) => string;

/**
 * Adds a new swarm to the system for managing client sessions.
 *
 * This function registers a new swarm, which serves as the root entity for initiating and managing client sessions within the system.
 * The swarm defines the structure and behavior of agent interactions and session workflows. Only swarms registered through this function
 * are recognized by the system. The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts,
 * providing a clean execution environment. The function logs the operation if enabled and returns the swarm's name upon successful registration.
 *
 * @param {ISwarmSchema} swarmSchema - The schema defining the swarm's properties, including its name (`swarmName`), default agent, and other configuration details.
 * @returns {string} The name of the newly added swarm (`swarmSchema.swarmName`), confirming its registration.
 * @throws {Error} If the swarm schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate swarm name).
 * @example
 * const swarmSchema = { swarmName: "TaskSwarm", defaultAgent: "AgentX" };
 * const swarmName = addSwarm(swarmSchema);
 * console.log(swarmName); // Outputs "TaskSwarm"
 */
declare const addSwarm: (swarmSchema: ISwarmSchema) => string;

/**
 * Adds a new tool to the tool registry for use by agents in the swarm system.
 *
 * This function registers a new tool, enabling agents within the swarm to utilize it for performing specific tasks or operations.
 * Tools must be registered through this function to be recognized by the swarm, though the original comment suggests an association with
 * `addAgent`, likely intending that tools are linked to agent capabilities. The execution is wrapped in `beginContext` to ensure it runs
 * outside of existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled
 * and returns the tool's name upon successful registration.
 *
 * @template T - The type of the tool's input/output data, defaulting to a record of string keys and `ToolValue` values if unspecified.
 * @param {IAgentTool<T>} toolSchema - The schema defining the tool's properties, including its name (`toolName`) and other configuration details (e.g., function, description).
 * @returns {string} The name of the newly added tool (`toolSchema.toolName`), confirming its registration.
 * @throws {Error} If the tool schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate tool name).
 * @example
 * const toolSchema = { toolName: "Calculator", fn: (x: number) => x * 2, description: "Doubles a number" };
 * const toolName = addTool(toolSchema);
 * console.log(toolName); // Outputs "Calculator"
 */
declare const addTool: <T extends any = Record<string, ToolValue>>(toolSchema: IAgentTool<T>) => string;

/**
 * Adds a new state to the state registry for use within the swarm system.
 *
 * This function registers a new state, enabling the swarm to manage and utilize it for agent operations or shared data persistence.
 * Only states registered through this function are recognized by the swarm. If the state is marked as shared, it initializes a connection
 * to the shared state service and waits for its initialization. The execution is wrapped in `beginContext` to ensure it runs outside of
 * existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled and returns
 * the state's name upon successful registration.
 *
 * @template T - The type of data stored in the state (defaults to `any` if unspecified).
 * @param {IStateSchema<T>} stateSchema - The schema defining the state's properties, including its name (`stateName`), shared status (`shared`), and other configuration details.
 * @returns {string} The name of the newly added state (`stateSchema.stateName`), confirming its registration.
 * @throws {Error} If the state schema is invalid, registration fails (e.g., duplicate state name), or shared state initialization encounters an error.
 * @example
 * const stateSchema = { stateName: "UserPrefs", shared: true, initialValue: { theme: "dark" } };
 * const stateName = addState(stateSchema);
 * console.log(stateName); // Outputs "UserPrefs"
 */
declare const addState: <T extends unknown = any>(stateSchema: IStateSchema<T>) => string;

/**
 * Adds a new embedding engine to the embedding registry for use within the swarm system.
 *
 * This function registers a new embedding engine, enabling the swarm to utilize it for tasks such as vector generation or similarity comparisons.
 * Only embeddings registered through this function are recognized by the swarm. The execution is wrapped in `beginContext` to ensure it runs
 * outside of existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled
 * and returns the embedding's name upon successful registration.
 *
 * @param {IEmbeddingSchema} embeddingSchema - The schema defining the embedding engine's properties, including its name (`embeddingName`) and configuration details.
 * @returns {string} The name of the newly added embedding (`embeddingSchema.embeddingName`), confirming its registration.
 * @throws {Error} If the embedding schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate embedding name).
 * @example
 * const embeddingSchema = { embeddingName: "TextEmbedder", model: "bert-base" };
 * const embeddingName = addEmbedding(embeddingSchema);
 * console.log(embeddingName); // Outputs "TextEmbedder"
 */
declare const addEmbedding: (embeddingSchema: IEmbeddingSchema) => string;

/**
 * Adds a new storage engine to the storage registry for use within the swarm system.
 *
 * This function registers a new storage engine, enabling the swarm to manage and utilize it for persistent data storage across agents or sessions.
 * Only storages registered through this function are recognized by the swarm. If the storage is marked as shared, it initializes a connection to the
 * shared storage service and waits for its initialization. The execution is wrapped in `beginContext` to ensure it runs outside of existing method
 * and execution contexts, providing a clean execution environment. The function logs the operation if enabled and returns the storage's name upon
 * successful registration.
 *
 * @template T - The type of data stored in the storage, extending `IStorageData` (defaults to `IStorageData` if unspecified).
 * @param {IStorageSchema<T>} storageSchema - The schema defining the storage engine's properties, including its name (`storageName`), shared status (`shared`), and other configuration details.
 * @returns {string} The name of the newly added storage (`storageSchema.storageName`), confirming its registration.
 * @throws {Error} If the storage schema is invalid, registration fails (e.g., duplicate storage name), or shared storage initialization encounters an error.
 * @example
 * const storageSchema = { storageName: "UserData", shared: true, type: "key-value" };
 * const storageName = addStorage(storageSchema);
 * console.log(storageName); // Outputs "UserData"
 */
declare const addStorage: <T extends IStorageData = IStorageData>(storageSchema: IStorageSchema<T>) => string;

/**
 * Adds a new policy for agents in the swarm system by registering it with validation and schema services.
 * Registers the policy with PolicyValidationService for runtime validation and PolicySchemaService for schema management.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with PolicyValidationService (policy registration and validation), PolicySchemaService (schema registration),
 * and LoggerService (logging). Part of the swarm setup process, enabling policies to govern agent behavior,
 * complementing runtime functions like commitAssistantMessage by defining operational rules upfront.
 *
 * @param {IPolicySchema} policySchema - The schema of the policy to be added, including policyName and other configuration details.
 * @returns {string} The name of the policy that was added, as specified in policySchema.policyName.
 * @throws {Error} If policy registration fails due to validation errors in PolicyValidationService or PolicySchemaService.
 */
declare const addPolicy: (policySchema: IPolicySchema) => string;

declare const markOnline: (clientId: string, swarmName: SwarmName) => Promise<void>;

declare const markOffline: (clientId: string, swarmName: SwarmName) => Promise<void>;

/**
 * Commits the output of a tool execution to the active agent in a swarm session.
 *
 * This function ensures that the tool output is committed only if the specified agent is still the active agent in the swarm session.
 * It performs validation checks on the agent, session, and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} toolId - The unique identifier of the tool whose output is being committed.
 * @param {string} content - The content or result of the tool execution to be committed.
 * @param {string} clientId - The unique identifier of the client session associated with the operation.
 * @param {AgentName} agentName - The name of the agent committing the tool output.
 * @returns {Promise<void>} A promise that resolves when the tool output is successfully committed, or immediately if the operation is skipped due to an agent change.
 * @throws {Error} If validation fails (e.g., invalid agent, session, or swarm) or if the session public service encounters an error during the commit operation.
 * @example
 * await commitToolOutput("tool-123", "Tool execution result", "client-456", "AgentX");
 */
declare const commitToolOutput: (toolId: string, content: string, clientId: string, agentName: string) => Promise<void>;

/**
 * Commits a system-generated message to the active agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the message.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (message committing),
 * and LoggerService (logging). Complements functions like commitAssistantMessage by handling system messages (e.g., configuration or control messages)
 * rather than assistant-generated responses.
 *
 * @param {string} content - The content of the system message to commit, typically related to system state or control instructions.
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent to commit the message for, validated against registered agents.
 * @returns {Promise<void>} A promise that resolves when the message is committed or skipped (e.g., agent mismatch).
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
declare const commitSystemMessage: (content: string, clientId: string, agentName: string) => Promise<void>;

/**
 * Commits a flush of agent history for a specific client and agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before flushing the history.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (history flush),
 * and LoggerService (logging). Complements functions like commitAssistantMessage by clearing agent history rather than adding messages.
 *
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent whose history is to be flushed, validated against registered agents.
 * @returns {Promise<void>} A promise that resolves when the history flush is committed or skipped (e.g., agent mismatch).
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
declare const commitFlush: (clientId: string, agentName: string) => Promise<void>;

/**
 * Commits a user message to the active agent's history in a swarm session without triggering a response.
 *
 * This function commits a user message to the history of the specified agent, ensuring the agent is still active in the swarm session.
 * It performs validation checks on the agent, session, and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} content - The content of the user message to be committed.
 * @param {string} clientId - The unique identifier of the client session associated with the operation.
 * @param {string} agentName - The name of the agent to whose history the message will be committed.
 * @returns {Promise<void>} A promise that resolves when the message is successfully committed, or immediately if the operation is skipped due to an agent change.
 * @throws {Error} If validation fails (e.g., invalid agent, session, or swarm) or if the session public service encounters an error during the commit operation.
 * @example
 * await commitUserMessage("User input message", "client-123", "AgentX");
 */
declare const commitUserMessage: <Payload extends object = object>(content: string, mode: ExecutionMode, clientId: string, agentName: string, payload?: Payload) => Promise<void>;

/**
 * Commits the output of a tool execution to the active agent in a swarm session without checking the active agent.
 *
 * This function forcefully commits the tool output to the session, bypassing the check for whether the agent is still active in the swarm session.
 * It performs validation on the session and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} toolId - The unique identifier of the tool whose output is being committed.
 * @param {string} content - The content or result of the tool execution to be committed.
 * @param {string} clientId - The unique identifier of the client session associated with the operation.
 * @returns {Promise<void>} A promise that resolves when the tool output is successfully committed.
 * @throws {Error} If validation fails (e.g., invalid session or swarm) or if the session public service encounters an error during the commit operation.
 * @example
 * await commitToolOutputForce("tool-123", "Tool execution result", "client-456");
 */
declare const commitToolOutputForce: (toolId: string, content: string, clientId: string) => Promise<void>;

/**
 * Forcefully commits a system-generated message to a session in the swarm system, without checking the active agent.
 * Validates the session and swarm, then proceeds with committing the message regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SessionPublicService (message committing), and LoggerService (logging).
 * Unlike commitSystemMessage, this function skips agent validation and active agent checks, providing a more aggressive commit mechanism,
 * analogous to commitAssistantMessageForce vs. commitAssistantMessage.
 *
 * @param {string} content - The content of the system message to commit, typically related to system state or control instructions.
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent (unused in this implementation, included for interface consistency with commitSystemMessage).
 * @returns {Promise<void>} A promise that resolves when the message is committed.
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
declare const commitSystemMessageForce: (content: string, clientId: string) => Promise<void>;

/**
 * Forcefully commits a flush of agent history for a specific client in the swarm system, without checking the active agent.
 * Validates the session and swarm, then proceeds with flushing the history regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SessionPublicService (history flush), and LoggerService (logging).
 * Unlike commitFlush, this function skips agent validation and active agent checks, providing a more aggressive flush mechanism,
 * analogous to commitAssistantMessageForce vs. commitAssistantMessage.
 *
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent (unused in this implementation, included for interface consistency with commitFlush).
 * @returns {Promise<void>} A promise that resolves when the history flush is committed.
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
declare const commitFlushForce: (clientId: string) => Promise<void>;

/**
 * Commits a user message to the active agent's history in a swarm session without triggering a response and without checking the active agent.
 *
 * This function forcefully commits a user message to the history of the active agent in the specified swarm session, bypassing the check for whether the agent is still active.
 * It performs validation on the session and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} content - The content of the user message to be committed.
 * @param {string} clientId - The unique identifier of the client session associated with the operation.
 * @returns {Promise<void>} A promise that resolves when the message is successfully committed.
 * @throws {Error} If validation fails (e.g., invalid session or swarm) or if the session public service encounters an error during the commit operation.
 * @example
 * await commitUserMessageForce("User input message", "client-123");
 */
declare const commitUserMessageForce: <Payload extends object = object>(content: string, mode: ExecutionMode, clientId: string, payload?: Payload) => Promise<void>;

/**
 * Commits an assistant-generated message to the active agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the message.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (message committing),
 * and LoggerService (logging). Complements functions like cancelOutput by persisting assistant messages rather than canceling output.
 *
 * @param {string} content - The content of the assistant message to commit, typically generated by the agent.
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent to commit the message for, validated against registered agents.
 * @returns {Promise<void>} A promise that resolves when the message is committed or skipped (e.g., agent mismatch).
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
declare const commitAssistantMessage: (content: string, clientId: string, agentName: string) => Promise<void>;

/**
 * Forcefully commits an assistant-generated message to a session in the swarm system, without checking the active agent.
 * Validates the session and swarm, then proceeds with committing the message regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SessionPublicService (message committing), and LoggerService (logging).
 * Unlike commitAssistantMessage, this function skips agent validation and active agent checks, providing a more aggressive commit mechanism,
 * analogous to cancelOutputForce vs. cancelOutput.
 *
 * @param {string} content - The content of the assistant message to commit, typically generated by an agent.
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent (unused in this implementation, included for interface consistency with commitAssistantMessage).
 * @returns {Promise<void>} A promise that resolves when the message is committed.
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
declare const commitAssistantMessageForce: (content: string, clientId: string) => Promise<void>;

/**
 * Cancels the awaited output for a specific client and agent by emitting an empty string.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before cancellation.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), and SwarmPublicService (agent retrieval and output cancellation).
 *
 * @param {string} clientId - The ID of the client whose output is to be canceled, validated against active sessions.
 * @param {string} agentName - The name of the agent for which the output is canceled, validated against registered agents.
 * @returns {Promise<void>} A promise that resolves when the output cancellation is complete or skipped (e.g., agent mismatch).
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
declare const cancelOutput: (clientId: string, agentName: string) => Promise<void>;

/**
 * Forcefully cancels the awaited output for a specific client by emitting an empty string, without checking the active agent.
 * Validates the session and swarm, then proceeds with cancellation regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SwarmPublicService (output cancellation), and LoggerService (logging).
 * Unlike cancelOutput, this function skips agent validation and active agent checks, providing a more aggressive cancellation mechanism.
 *
 * @param {string} clientId - The ID of the client whose output is to be canceled, validated against active sessions.
 * @param {string} agentName - The name of the agent (unused in this implementation, included for interface consistency with cancelOutput).
 * @returns {Promise<void>} A promise that resolves when the output cancellation is complete.
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
declare const cancelOutputForce: (clientId: string) => Promise<void>;

/**
 * Prevents the next tool from being executed for a specific client and agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before stopping tool execution.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (tool execution stop),
 * ToolValidationService (tool context), and LoggerService (logging). Complements functions like commitFlush by controlling tool flow rather than clearing history.
 *
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent whose next tool execution is to be stopped, validated against registered agents.
 * @returns {Promise<void>} A promise that resolves when the tool stop is committed or skipped (e.g., agent mismatch).
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
declare const commitStopTools: (clientId: string, agentName: string) => Promise<void>;

/**
 * Forcefully prevents the next tool from being executed for a specific client in the swarm system, without checking the active agent.
 * Validates the session and swarm, then proceeds with stopping tool execution regardless of the current agent state.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SessionPublicService (tool execution stop), ToolValidationService (tool context), and LoggerService (logging).
 * Unlike commitStopTools, this function skips agent validation and active agent checks, providing a more aggressive stop mechanism,
 * analogous to commitFlushForce vs. commitFlush.
 *
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent (unused in this implementation, included for interface consistency with commitStopTools).
 * @returns {Promise<void>} A promise that resolves when the tool stop is committed.
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
declare const commitStopToolsForce: (clientId: string) => Promise<void>;

/**
 * Emits a string as model output without executing an incoming message or checking the active agent.
 *
 * This function directly emits a provided string as output from the swarm session, bypassing message execution and agent activity checks.
 * It is designed exclusively for sessions established via `makeConnection`, ensuring compatibility with its connection model.
 * The execution is wrapped in `beginContext` for a clean environment, validates the session and swarm, and throws an error if the session mode
 * is not "makeConnection". The operation is logged if enabled, and resolves when the content is successfully emitted.
 *
 * @param {string} content - The content to be emitted as the model output.
 * @param {string} clientId - The unique identifier of the client session emitting the content.
 * @returns {Promise<void>} A promise that resolves when the content is emitted.
 * @throws {Error} If the session mode is not "makeConnection", or if session or swarm validation fails.
 * @example
 * await emitForce("Direct output", "client-123"); // Emits "Direct output" in a makeConnection session
 */
declare const emitForce: (content: string, clientId: string) => Promise<void>;

/**
 * Sends a message to the active agent in a swarm session as if it originated from the client side, forcing execution regardless of agent activity.
 *
 * This function executes a command or message on behalf of the active agent within a swarm session, designed for scenarios like reviewing tool output
 * or initiating a model-to-client conversation. Unlike `execute`, it does not check if the agent is currently active, ensuring execution even if the
 * agent has changed or is inactive. It validates the session and swarm, executes the content with performance tracking and event bus notifications,
 * and is wrapped in `beginContext` for a clean environment and `ExecutionContextService` for metadata tracking.
 *
 * @param {string} content - The content or command to be executed by the active agent.
 * @param {string} clientId - The unique identifier of the client session requesting the execution.
 * @returns {Promise<string>} A promise that resolves to the result of the execution.
 * @throws {Error} If session or swarm validation fails, or if the execution process encounters an error.
 * @example
 * const result = await executeForce("Force this execution", "client-123");
 * console.log(result); // Outputs the agent's response regardless of its active state
 */
declare const executeForce: (content: string, clientId: string) => Promise<string>;

/**
 * Interface for the parameters of the makeAutoDispose function.
 * @interface IMakeDisposeParams
 * @property {number} timeoutSeconds - Timeout in seconds before auto-dispose is triggered.
 * @property {(clientId: string, swarmName: SwarmName) => void} [onDestroy] - Optional callback invoked when the session is closed.
 */
interface IMakeDisposeParams {
    timeoutSeconds: number;
    onDestroy?: (clientId: string, swarmName: SwarmName) => void;
}
/**
 * Creates an auto-dispose mechanism for a client session in a swarm.
 *
 * This function establishes a timer-based auto-dispose system that monitors client activity in a swarm session. If no activity
 * is detected (via the `tick` method) within the specified timeout period, the session is automatically disposed using `disposeConnection`.
 * The mechanism uses a `Source` from `functools-kit` to manage the timer, which can be reset or stopped manually. The execution is wrapped
 * in `beginContext` for a clean environment, and an optional callback (`onDestroy`) can be provided to handle post-disposal actions.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm associated with the session.
 * @param {Partial<IMakeDisposeParams>} [params={}] - Optional parameters for configuring the auto-dispose behavior, including timeout and callback.
 * @returns {{ tick: () => void, destroy: () => void }} An object with `tick` to signal activity and `destroy` to stop the auto-dispose mechanism.
 * @throws {Error} If disposal via `disposeConnection` fails when triggered automatically.
 * @example
 * const { tick, destroy } = makeAutoDispose("client-123", "TaskSwarm", {
 *   timeoutSeconds: 30,
 *   onDestroy: (id, name) => console.log(`Session ${id} in ${name} closed`)
 * });
 * tick(); // Reset timer
 * setInterval(tick, 10000); // Keep alive every 10 seconds
 * destroy(); // Stop manually
 */
declare const makeAutoDispose: (clientId: string, swarmName: string, args_2?: Partial<IMakeDisposeParams>) => {
    tick(): void;
    destroy(): void;
};

/**
 * Sends a message to the active agent in a swarm session as if it originated from the client side.
 *
 * This function executes a command or message on behalf of the specified agent within a swarm session, designed for scenarios like reviewing tool output
 * or initiating a model-to-client conversation. It validates the agent and session, checks if the specified agent is still active, and executes the content
 * with performance tracking and event bus notifications. The execution is wrapped in `beginContext` for a clean environment and runs within an
 * `ExecutionContextService` context for metadata tracking. If the active agent has changed, the operation is skipped.
 *
 * @param {string} content - The content or command to be executed by the agent.
 * @param {string} clientId - The unique identifier of the client session requesting the execution.
 * @param {AgentName} agentName - The name of the agent intended to execute the command.
 * @returns {Promise<string>} A promise that resolves to the result of the execution, or an empty string if skipped due to an agent change.
 * @throws {Error} If agent, session, or swarm validation fails, or if the execution process encounters an error.
 * @example
 * const result = await execute("Review this output", "client-123", "AgentX");
 * console.log(result); // Outputs the agent's response or "" if skipped
 */
declare const execute: (content: string, clientId: string, agentName: string) => Promise<string>;

/**
 * Emits a string as model output without executing an incoming message, with agent activity validation.
 *
 * This function directly emits a provided string as output from the swarm session, bypassing message execution, and is designed exclusively
 * for sessions established via `makeConnection`. It validates the session, swarm, and specified agent, ensuring the agent is still active
 * before emitting. If the active agent has changed, the operation is skipped. The execution is wrapped in `beginContext` for a clean environment,
 * logs the operation if enabled, and throws an error if the session mode is not "makeConnection".
 *
 * @param {string} content - The content to be emitted as the model output.
 * @param {string} clientId - The unique identifier of the client session emitting the content.
 * @param {AgentName} agentName - The name of the agent intended to emit the content.
 * @returns {Promise<void>} A promise that resolves when the content is emitted, or resolves early if skipped due to an agent change.
 * @throws {Error} If the session mode is not "makeConnection", or if agent, session, or swarm validation fails.
 * @example
 * await emit("Direct output", "client-123", "AgentX"); // Emits "Direct output" if AgentX is active
 */
declare const emit: (content: string, clientId: string, agentName: string) => Promise<void>;

/**
 * Executes a message statelessly with an agent in a swarm session, bypassing chat history.
 *
 * This function processes a command or message using the specified agent without appending it to the chat history, designed to prevent
 * model history overflow when handling storage output or one-off tasks. It validates the agent, session, and swarm, checks if the specified
 * agent is still active, and executes the content with performance tracking and event bus notifications. The execution is wrapped in
 * `beginContext` for a clean environment and `ExecutionContextService` for metadata tracking. If the active agent has changed, the operation
 * is skipped, returning an empty string.
 *
 * @param {string} content - The content or command to be executed statelessly by the agent.
 * @param {string} clientId - The unique identifier of the client session requesting the execution.
 * @param {AgentName} agentName - The name of the agent intended to execute the command.
 * @returns {Promise<string>} A promise that resolves to the result of the execution, or an empty string if skipped due to an agent change.
 * @throws {Error} If agent, session, or swarm validation fails, or if the execution process encounters an error.
 * @example
 * const result = await runStateless("Process this data", "client-123", "AgentX");
 * console.log(result); // Outputs the agent's response without affecting history
 */
declare const runStateless: (content: string, clientId: string, agentName: string) => Promise<string>;

/**
 * Executes a message statelessly with the active agent in a swarm session, bypassing chat history and forcing execution regardless of agent activity.
 *
 * This function processes a command or message using the active agent without appending it to the chat history, designed to prevent model history
 * overflow when handling storage output or one-off tasks. Unlike `runStateless`, it does not check if the agent is currently active, ensuring execution
 * even if the agent has changed or is inactive. It validates the session and swarm, executes the content with performance tracking and event bus
 * notifications, and is wrapped in `beginContext` for a clean environment and `ExecutionContextService` for metadata tracking.
 *
 * @param {string} content - The content or command to be executed statelessly by the active agent.
 * @param {string} clientId - The unique identifier of the client session requesting the execution.
 * @returns {Promise<string>} A promise that resolves to the result of the execution.
 * @throws {Error} If session or swarm validation fails, or if the execution process encounters an error.
 * @example
 * const result = await runStatelessForce("Process this data forcefully", "client-123");
 * console.log(result); // Outputs the agent's response without affecting history
 */
declare const runStatelessForce: (content: string, clientId: string) => Promise<string>;

/**
 * A connection factory for establishing a client connection to a swarm, returning a function to send messages.
 *
 * This factory creates a queued connection to the swarm, allowing the client to send messages to the active agent.
 * It is designed for real-time communication, leveraging the session public service for message handling.
 *
 * @param {ReceiveMessageFn} connector - The function to receive incoming messages from the swarm.
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm to connect to.
 * @returns {SendMessageFn} A function to send messages to the swarm.
 * @throws {Error} If swarm or session validation fails, or if the connection process encounters an error.
 * @example
 * const sendMessage = makeConnection((msg) => console.log(msg), "client-123", "TaskSwarm");
 * await sendMessage("Hello, swarm!");
 */
declare const makeConnection: {
    <Payload extends object = object>(connector: ReceiveMessageFn, clientId: string, swarmName: SwarmName): (content: string, payload?: Payload) => Promise<void>;
    /**
     * A scheduled connection factory for a client to a swarm, returning a function to send delayed messages.
     *
     * This factory extends `makeConnection` by adding scheduling capabilities, delaying message sends based on the configured delay.
     * It commits messages to the agent's history immediately via `commitUserMessage` and sends them after the delay if the session remains active.
     *
     * @param {ReceiveMessageFn} connector - The function to receive incoming messages from the swarm.
     * @param {string} clientId - The unique identifier of the client session.
     * @param {SwarmName} swarmName - The name of the swarm to connect to.
     * @param {Partial<IMakeConnectionConfig>} [config] - Configuration object with an optional delay (defaults to `SCHEDULED_DELAY`).
     * @returns {SendMessageFn} A function to send scheduled messages to the swarm.
     * @throws {Error} If swarm or session validation fails, or if the scheduled send process encounters an error.
     * @example
     * const sendScheduled = makeConnection.scheduled((msg) => console.log(msg), "client-123", "TaskSwarm", { delay: 2000 });
     * await sendScheduled("Delayed message"); // Sent after 2 seconds
     */
    scheduled<Payload extends object = object>(connector: ReceiveMessageFn, clientId: string, swarmName: SwarmName, { delay }?: Partial<IMakeConnectionConfig>): (content: string, payload?: Payload) => Promise<void>;
    /**
     * A rate-limited connection factory for a client to a swarm, returning a function to send throttled messages.
     *
     * This factory extends `makeConnection` by adding rate-limiting capabilities, throttling message sends based on the configured delay.
     * If the rate limit is exceeded, it warns and returns an empty result instead of throwing an error.
     *
     * @param {ReceiveMessageFn} connector - The function to receive incoming messages from the swarm.
     * @param {string} clientId - The unique identifier of the client session.
     * @param {SwarmName} swarmName - The name of the swarm to connect to.
     * @param {Partial<IMakeConnectionConfig>} [config] - Configuration object with an optional delay (defaults to `RATE_DELAY`).
     * @returns {SendMessageFn} A function to send rate-limited messages to the swarm.
     * @throws {Error} If swarm or session validation fails, or if the send process encounters a non-rate-limit error.
     * @example
     * const sendRateLimited = makeConnection.rate((msg) => console.log(msg), "client-123", "TaskSwarm", { delay: 5000 });
     * await sendRateLimited("Throttled message"); // Limited to one send every 5 seconds
     */
    rate<Payload extends object = object>(connector: ReceiveMessageFn, clientId: string, swarmName: SwarmName, { delay }?: Partial<IMakeConnectionConfig>): (content: string, payload?: Payload) => Promise<void | "">;
};
/**
 * Configuration interface for scheduling or rate-limiting messages.
 *
 * @interface IMakeConnectionConfig
 * @property {number} [delay] - The delay in milliseconds for scheduling or rate-limiting messages (optional).
 */
interface IMakeConnectionConfig {
    delay?: number;
}

/**
 * Executes a single command in a swarm session and disposes of it, optimized for developer troubleshooting.
 *
 * This function creates a temporary swarm session, executes a provided command, and disposes of the session upon completion.
 * It is designed for developer needs, such as testing tool execution or troubleshooting, with performance tracking and event bus notifications.
 * The execution is wrapped in `beginContext` for a clean environment and runs within an `ExecutionContextService` context for metadata tracking.
 * The operation is TTL-limited and queued to manage resource usage efficiently.
 *
 * @param {string} content - The content or command to process in the swarm session.
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm in which the command is executed.
 * @returns {Promise<string>} A promise that resolves to the result of the command execution.
 * @throws {Error} If swarm or session validation fails, execution encounters an error, or disposal fails.
 * @example
 * const result = await complete("Calculate 2 + 2", "client-123", "MathSwarm");
 * console.log(result); // Outputs "4"
 */
declare const complete: <Payload extends object = object>(content: string, clientId: string, swarmName: SwarmName, payload?: Payload) => Promise<string>;

/**
 * Creates a session for a client and swarm, providing methods to complete and dispose of it.
 *
 * This factory establishes a session in "session" mode, allowing content execution with queuing for sequential processing.
 * It returns an object with `complete` to process content and `dispose` to clean up the session.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm to connect to.
 * @returns {{ complete: TComplete, dispose: () => Promise<void> }} An object with `complete` and `dispose` methods.
 * @throws {Error} If swarm or session validation fails, or if execution/disposal encounters an error.
 * @example
 * const { complete, dispose } = session("client-123", "TaskSwarm");
 * const result = await complete("Hello, swarm!");
 * console.log(result); // Outputs the swarm's response
 * await dispose();
 */
declare const session: {
    <Payload extends object = object>(clientId: string, swarmName: SwarmName, { onDispose }?: Partial<Omit<ISessionConfig, "delay">>): {
        complete: (content: string, payload?: Payload) => Promise<string>;
        dispose: () => Promise<void>;
    };
    /**
     * Creates a scheduled session for a client and swarm, delaying content execution.
     *
     * This factory extends `session` by adding scheduling capabilities, delaying `complete` calls based on the configured delay.
     * It commits messages to the agent's history immediately via `commitUserMessage` and executes them after the delay if the session remains active.
     *
     * @param {string} clientId - The unique identifier of the client session.
     * @param {SwarmName} swarmName - The name of the swarm to connect to.
     * @param {Partial<ISessionConfig>} [config] - Configuration object with an optional delay (defaults to `SCHEDULED_DELAY`).
     * @returns {{ complete: TComplete, dispose: () => Promise<void> }} An object with scheduled `complete` and `dispose` methods.
     * @throws {Error} If swarm or session validation fails, or if execution/disposal encounters an error.
     * @example
     * const { complete, dispose } = session.scheduled("client-123", "TaskSwarm", { delay: 2000 });
     * const result = await complete("Delayed message"); // Executed after 2 seconds
     * console.log(result);
     * await dispose();
     */
    scheduled<Payload extends object = object>(clientId: string, swarmName: SwarmName, { delay, onDispose }?: Partial<ISessionConfig>): {
        complete: (content: string, payload?: Payload) => Promise<string>;
        dispose: () => Promise<void>;
    };
    /**
     * Creates a rate-limited session for a client and swarm, throttling content execution.
     *
     * This factory extends `session` by adding rate-limiting capabilities, throttling `complete` calls based on the configured delay.
     * If the rate limit is exceeded, it warns and returns an empty string instead of throwing an error.
     *
     * @param {string} clientId - The unique identifier of the client session.
     * @param {SwarmName} swarmName - The name of the swarm to connect to.
     * @param {Partial<ISessionConfig>} [config] - Configuration object with an optional delay (defaults to `SCHEDULED_DELAY`).
     * @returns {{ complete: TComplete, dispose: () => Promise<void> }} An object with rate-limited `complete` and `dispose` methods.
     * @throws {Error} If swarm or session validation fails, or if execution/disposal encounters a non-rate-limit error.
     * @example
     * const { complete, dispose } = session.rate("client-123", "TaskSwarm", { delay: 5000 });
     * const result = await complete("Throttled message"); // Limited to one execution every 5 seconds
     * console.log(result);
     * await dispose();
     */
    rate<Payload extends object = object>(clientId: string, swarmName: SwarmName, { delay, onDispose }?: Partial<ISessionConfig>): {
        complete(content: string, payload?: Payload): Promise<string>;
        dispose: () => Promise<void>;
    };
};
/**
 * Configuration interface for scheduled or rate-limited sessions.
 *
 * @interface ISessionConfig
 * @property {number} [delay] - The delay in milliseconds for scheduling or rate-limiting session completions (optional).
 */
interface ISessionConfig {
    delay?: number;
    onDispose?: () => void;
}

/**
 * Disposes of a client session and all related resources within a swarm.
 *
 * This function terminates a client session, cleaning up associated swarm, agent, storage, state, and auxiliary resources (e.g., history, logs, performance metrics).
 * It ensures that all dependencies are properly disposed of to prevent resource leaks, using sets to avoid redundant disposal of shared resources.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 * The function logs the operation if enabled and resolves when all disposal tasks are complete.
 *
 * @param {string} clientId - The unique identifier of the client session to dispose of.
 * @param {SwarmName} swarmName - The name of the swarm associated with the session.
 * @param {string} [methodName="function.target.disposeConnection"] - The name of the method invoking the disposal (defaults to `METHOD_NAME`).
 * @returns {Promise<void>} A promise that resolves when the session and all related resources are fully disposed.
 * @throws {Error} If session or swarm validation fails, or if any disposal operation encounters an error.
 * @example
 * await disposeConnection("client-123", "TaskSwarm");
 */
declare const disposeConnection: (clientId: string, swarmName: string, methodName?: any) => Promise<void>;

/**
 * Retrieves the payload from the current PayloadContextService context.
 * Returns null if no context is available. Logs the operation if logging is enabled.
 * @template Payload - The type of the payload object, defaults to a generic object.
 * @returns the payload data from the context, or null if no context exists.
 * @example
 * const payload = await getPayload<{ id: number }>();
 * console.log(payload); // { id: number } or null
 */
declare const getPayload: <Payload extends object = object>() => Payload | null;

/**
 * Retrieves the name of the active agent for a given client session in a swarm.
 *
 * This function fetches the name of the currently active agent associated with the specified client session within a swarm.
 * It validates the client session and swarm, logs the operation if enabled, and delegates the retrieval to the swarm public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} clientId - The unique identifier of the client session whose active agent name is being retrieved.
 * @returns {Promise<string>} A promise that resolves to the name of the active agent (`AgentName`) associated with the client session.
 * @throws {Error} If the client session is invalid, the swarm validation fails, or the swarm public service encounters an error during retrieval.
 * @example
 * const agentName = await getAgentName("client-123");
 * console.log(agentName); // Outputs "AgentX"
 */
declare const getAgentName: (clientId: string) => Promise<string>;

/**
 * Retrieves the history prepared for a specific agent, incorporating rescue algorithm tweaks.
 *
 * This function fetches the history tailored for a specified agent within a swarm session, applying any rescue strategies defined in the system (e.g., `CC_RESQUE_STRATEGY` from `GLOBAL_CONFIG`).
 * It validates the client session and agent, logs the operation if enabled, and retrieves the history using the agent's prompt configuration via the history public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} clientId - The unique identifier of the client session requesting the history.
 * @param {AgentName} agentName - The name of the agent whose history is being retrieved.
 * @returns {Promise<IModelMessage[]>} A promise that resolves to an array of history messages (`IModelMessage[]`) prepared for the agent, including any rescue algorithm adjustments.
 * @throws {Error} If validation fails (e.g., invalid session or agent) or if the history public service encounters an error during retrieval.
 * @example
 * const history = await getAgentHistory("client-123", "AgentX");
 * console.log(history); // Outputs array of IModelMessage objects
 */
declare const getAgentHistory: (clientId: string, agentName: string) => Promise<IModelMessage<object>[]>;

/**
 * Retrieves the session mode for a given client session in a swarm.
 *
 * This function returns the current mode of the specified client session, which can be one of `"session"`, `"makeConnection"`, or `"complete"`.
 * It validates the client session and associated swarm, logs the operation if enabled, and fetches the session mode using the session validation service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} clientId - The unique identifier of the client session whose mode is being retrieved.
 * @returns {Promise<"session" | "makeConnection" | "complete">} A promise that resolves to the session mode, indicating the current state of the session.
 * @throws {Error} If the client session is invalid, the swarm validation fails, or the session validation service encounters an error during mode retrieval.
 * @example
 * const mode = await getSessionMode("client-123");
 * console.log(mode); // Outputs "session", "makeConnection", or "complete"
 */
declare const getSessionMode: (clientId: string) => Promise<SessionMode>;

/**
 * Represents the session context, encapsulating client, method, and execution metadata.
 *
 * This interface defines the structure of the session context returned by `getSessionContext`, providing information about the client session,
 * the current method context (if available), and the execution context (if available) within the swarm system.
 *
 * @interface ISessionContext
 * @property {string | null} clientId - The unique identifier of the client session, or null if not available from either context.
 * @property {string} processId - The unique identifier of the process, sourced from `GLOBAL_CONFIG.CC_PROCESS_UUID`.
 * @property {IMethodContext | null} methodContext - The current method context, or null if no method context is active.
 * @property {IExecutionContext | null} executionContext - The current execution context, or null if no execution context is active.
 */
interface ISessionContext {
    clientId: string | null;
    processId: string;
    methodContext: IMethodContext | null;
    executionContext: IExecutionContext | null;
}
/**
 * Retrieves the session context for the current execution environment.
 *
 * This function constructs and returns the session context, including the client ID, process ID, and available method and execution contexts.
 * It logs the operation if enabled, checks for active contexts using the `MethodContextService` and `ExecutionContextService`, and derives the client ID from either context if available.
 * Unlike other functions, it does not perform explicit validation or require a `clientId` parameter, as it relies on the current execution environment's state.
 *
 * @returns {Promise<ISessionContext>} A promise that resolves to an object containing the session context, including `clientId`, `processId`, `methodContext`, and `executionContext`.
 * @throws {Error} If an unexpected error occurs while accessing the method or execution context services (though typically none are thrown in this implementation).
 * @example
 * const context = await getSessionContext();
 * console.log(context); // Outputs { clientId: "client-123", processId: "uuid-xyz", methodContext: {...}, executionContext: {...} }
 */
declare const getSessionContext: () => Promise<ISessionContext>;

/**
 * Retrieves the content of the most recent user message from a client's session history.
 *
 * This function fetches the raw history for a specified client using `getRawHistory` and finds the last entry where the role is "user" and the mode
 * is "user". It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result is
 * the content of the last user message as a string, or `null` if no matching user message exists in the history.
 *
 * @param {string} clientId - The unique identifier of the client session whose last user message is to be retrieved.
 * @returns {Promise<string | null>} A promise that resolves to the content of the last user message, or `null` if none is found.
 * @throws {Error} If `getRawHistory` fails due to session validation or history retrieval issues.
 * @example
 * const lastMessage = await getLastUserMessage("client-123");
 * console.log(lastMessage); // Outputs the last user message or null
 */
declare const getLastUserMessage: (clientId: string) => Promise<string>;

/**
 * Retrieves the user-specific history entries for a given client session.
 *
 * This function fetches the raw history for a specified client using `getRawHistory` and filters it to include only entries where both the role
 * and mode are "user". It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`.
 * The result is an array of history objects representing the user’s contributions in the session.
 *
 * @param {string} clientId - The unique identifier of the client session whose user history is to be retrieved.
 * @returns {Promise<object[]>} A promise that resolves to an array of history objects filtered by user role and mode.
 * @throws {Error} If `getRawHistory` fails due to session validation or history retrieval issues.
 * @example
 * const userHistory = await getUserHistory("client-123");
 * console.log(userHistory); // Outputs array of user history entries
 */
declare const getUserHistory: (clientId: string) => Promise<IModelMessage<object>[]>;

/**
 * Retrieves the assistant's history entries for a given client session.
 *
 * This function fetches the raw history for a specified client using `getRawHistory` and filters it to include only entries where the role is
 * "assistant". It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result
 * is an array of history objects representing the assistant's contributions in the session.
 *
 * @param {string} clientId - The unique identifier of the client session whose assistant history is to be retrieved.
 * @returns {Promise<object[]>} A promise that resolves to an array of history objects with the role "assistant".
 * @throws {Error} If `getRawHistory` fails due to session validation or history retrieval issues.
 * @example
 * const assistantHistory = await getAssistantHistory("client-123");
 * console.log(assistantHistory); // Outputs array of assistant history entries
 */
declare const getAssistantHistory: (clientId: string) => Promise<IModelMessage<object>[]>;

/**
 * Retrieves the content of the most recent assistant message from a client's session history.
 *
 * This function fetches the raw history for a specified client using `getRawHistory` and finds the last entry where the role is "assistant".
 * It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result is the content
 * of the last assistant message as a string, or `null` if no assistant message exists in the history.
 *
 * @param {string} clientId - The unique identifier of the client session whose last assistant message is to be retrieved.
 * @returns {Promise<string | null>} A promise that resolves to the content of the last assistant message, or `null` if none is found.
 * @throws {Error} If `getRawHistory` fails due to session validation or history retrieval issues.
 * @example
 * const lastMessage = await getLastAssistantMessage("client-123");
 * console.log(lastMessage); // Outputs the last assistant message or null
 */
declare const getLastAssistantMessage: (clientId: string) => Promise<string>;

/**
 * Retrieves the content of the most recent system message from a client's session history.
 *
 * This function fetches the raw history for a specified client using `getRawHistory` and finds the last entry where the role is "system".
 * It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result is the content
 * of the last system message as a string, or `null` if no system message exists in the history.
 *
 * @param {string} clientId - The unique identifier of the client session whose last system message is to be retrieved.
 * @returns {Promise<string | null>} A promise that resolves to the content of the last system message, or `null` if none is found.
 * @throws {Error} If `getRawHistory` fails due to session validation or history retrieval issues.
 * @example
 * const lastMessage = await getLastSystemMessage("client-123");
 * console.log(lastMessage); // Outputs the last system message or null
 */
declare const getLastSystemMessage: (clientId: string) => Promise<string>;

/**
 * Retrieves the raw, unmodified history for a given client session.
 *
 * This function fetches the complete history associated with a client’s active agent in a swarm session, without any filtering or modifications.
 * It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The function validates
 * the session and swarm, retrieves the current agent, and uses `historyPublicService.toArrayForRaw` to obtain the raw history as an array.
 * The result is a fresh copy of the history array.
 *
 * @param {string} clientId - The unique identifier of the client session whose raw history is to be retrieved.
 * @param {string} [methodName="function.history.getRawHistory"] - The name of the calling method, used for validation and logging (defaults to `METHOD_NAME`).
 * @returns {Promise<object[]>} A promise that resolves to an array containing the raw history entries.
 * @throws {Error} If session or swarm validation fails, or if history retrieval encounters an issue.
 * @example
 * const rawHistory = await getRawHistory("client-123");
 * console.log(rawHistory); // Outputs the full raw history array
 */
declare const getRawHistory: (clientId: string, methodName?: any) => Promise<IModelMessage<object>[]>;

/**
 * Emits a custom event to the swarm bus service.
 *
 * This function sends a custom event with a specified topic and payload to the swarm's bus service, allowing clients to broadcast messages
 * for other components to listen to. It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled.
 * The function enforces a restriction on reserved topic names (defined in `DISALLOWED_EVENT_SOURCE_LIST`), throwing an error if a reserved
 * topic is used. The event is structured as an `ICustomEvent` with the provided `clientId`, `topicName` as the source, and `payload`.
 *
 * @template T - The type of the payload, defaulting to `any` if unspecified.
 * @param {string} clientId - The unique identifier of the client emitting the event.
 * @param {string} topicName - The name of the event topic (must not be a reserved source).
 * @param {T} payload - The payload data to be included in the event.
 * @returns {Promise<void>} A promise that resolves when the event is successfully emitted.
 * @throws {Error} If the `topicName` is a reserved event source (e.g., "agent-bus", "session-bus").
 * @example
 * await event("client-123", "custom-topic", { message: "Hello, swarm!" });
 * // Emits an event with topic "custom-topic" and payload { message: "Hello, swarm!" }
 */
declare const event: <T extends unknown = any>(clientId: string, topicName: string, payload: T) => Promise<void>;

/**
 * Subscribes to a custom event on the swarm bus service and executes a callback when the event is received.
 *
 * This function sets up a listener for events with a specified topic on the swarm's bus service, invoking the provided callback with the event's
 * payload when triggered. It is wrapped in `beginContext` for a clean execution environment, logs the operation if enabled, and enforces restrictions
 * on reserved topic names (defined in `DISALLOWED_EVENT_SOURCE_LIST`). The callback is queued to ensure sequential processing of events. The function
 * supports a wildcard client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop
 * listening.
 *
 * @template T - The type of the payload data, defaulting to `any` if unspecified.
 * @param {string} clientId - The ID of the client to listen for events from, or "*" to listen to all clients.
 * @param {string} topicName - The name of the event topic to subscribe to (must not be a reserved source).
 * @param {(data: T) => void} fn - The callback function to execute when the event is received, passed the event payload.
 * @returns {() => void} A function to unsubscribe from the event listener.
 * @throws {Error} If the `topicName` is a reserved event source (e.g., "agent-bus"), or if the `clientId` is not "*" and no session exists.
 * @example
 * const unsubscribe = listenEvent("client-123", "custom-topic", (data) => console.log(data));
 * // Logs payload when "custom-topic" event is received for "client-123"
 * unsubscribe(); // Stops listening
 */
declare const listenEvent: <T extends unknown = any>(clientId: string, topicName: string, fn: (data: T) => void) => () => void;

/**
 * Subscribes to a custom event on the swarm bus service for a single occurrence, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events with a specified topic on the swarm's bus service, invoking the provided callback with the
 * event's payload when the event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment,
 * logs the operation if enabled, and enforces restrictions on reserved topic names (defined in `DISALLOWED_EVENT_SOURCE_LIST`). The callback is
 * queued to ensure sequential processing, and the listener unsubscribes after the first matching event. The function supports a wildcard client ID
 * ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @template T - The type of the payload data, defaulting to `any` if unspecified.
 * @param {string} clientId - The ID of the client to listen for events from, or "*" to listen to all clients.
 * @param {string} topicName - The name of the event topic to subscribe to (must not be a reserved source).
 * @param {(event: T) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event's payload.
 * @param {(data: T) => void} fn - The callback function to execute once when a matching event is received, passed the event payload.
 * @returns {() => void} A function to unsubscribe from the event listener before it triggers.
 * @throws {Error} If the `topicName` is a reserved event source (e.g., "agent-bus"), or if the `clientId` is not "*" and no session exists.
 * @example
 * const unsubscribe = listenEventOnce(
 *   "client-123",
 *   "custom-topic",
 *   (data) => data.value > 0,
 *   (data) => console.log(data)
 * );
 * // Logs payload once when "custom-topic" event with value > 0 is received
 * unsubscribe(); // Cancels listener if not yet triggered
 */
declare const listenEventOnce: <T extends unknown = any>(clientId: string, topicName: string, filterFn: (event: T) => boolean, fn: (data: T) => void) => () => void;

/**
 * Changes the active agent for a given client session in a swarm.
 *
 * This function facilitates switching the active agent in a swarm session, validating the session and agent dependencies,
 * logging the operation if enabled, and executing the change using a TTL-limited, queued runner.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts.
 *
 * @param {AgentName} agentName - The name of the agent to switch to.
 * @param {string} clientId - The unique identifier of the client session.
 * @returns {Promise<void>} A promise that resolves when the agent change is complete.
 * @throws {Error} If session or agent validation fails, or if the agent change process encounters an error.
 * @example
 * await changeToAgent("AgentX", "client-123");
 */
declare const changeToAgent: (agentName: string, clientId: string) => Promise<void>;

/**
 * Navigates back to the previous or default agent for a given client session in a swarm.
 *
 * This function switches the active agent to the previous agent in the navigation stack, or the default agent if no previous agent exists,
 * as determined by the `navigationPop` method. It validates the session and agent, logs the operation if enabled, and executes the change using a TTL-limited, queued runner.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @returns {Promise<void>} A promise that resolves when the agent change is complete.
 * @throws {Error} If session or agent validation fails, or if the agent change process encounters an error.
 * @example
 * await changeToPrevAgent("client-123");
 */
declare const changeToPrevAgent: (clientId: string) => Promise<void>;

/**
 * Navigates back to the default agent for a given client session in a swarm.
 *
 * This function switches the active agent to the default agent defined in the swarm schema for the specified client session.
 * It validates the session and default agent, logs the operation if enabled, and executes the change using a TTL-limited, queued runner.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @returns {Promise<void>} A promise that resolves when the default agent change is complete.
 * @throws {Error} If session or agent validation fails, or if the agent change process encounters an error.
 * @example
 * await changeToDefaultAgent("client-123");
 */
declare const changeToDefaultAgent: (clientId: string) => Promise<void>;

/**
 * Subscribes to agent-specific events on the swarm bus service for a specific client and executes a callback for each event.
 *
 * This function sets up a listener for events on the "agent-bus" topic associated with a given client ID, invoking the provided callback with the
 * event data whenever an agent event is received. It is wrapped in `beginContext` for a clean execution environment and logs the operation via
 * `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing of events. The function supports a wildcard client
 * ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop listening.
 *
 * @param {string} clientId - The ID of the client to subscribe to agent events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute when an agent event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the agent event listener.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenAgentEvent("client-123", (event) => console.log(event));
 * // Logs each agent event for "client-123"
 * unsubscribe(); // Stops listening
 */
declare const listenAgentEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to history-specific events on the swarm bus service for a specific client and executes a callback for each event.
 *
 * This function sets up a listener for events on the "history-bus" topic associated with a given client ID, invoking the provided callback with
 * the event data whenever a history event is received. It is wrapped in `beginContext` for a clean execution environment and logs the operation
 * via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing of events. The function supports a wildcard
 * client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop listening.
 *
 * @param {string} clientId - The ID of the client to subscribe to history events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute when a history event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the history event listener.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenHistoryEvent("client-123", (event) => console.log(event));
 * // Logs each history event for "client-123"
 * unsubscribe(); // Stops listening
 */
declare const listenHistoryEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to session-specific events on the swarm bus service for a specific client and executes a callback for each event.
 *
 * This function sets up a listener for events on the "session-bus" topic associated with a given client ID, invoking the provided callback with
 * the event data whenever a session event is received. It is wrapped in `beginContext` for a clean execution environment and logs the operation
 * via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing of events. The function supports a wildcard
 * client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop listening.
 *
 * @param {string} clientId - The ID of the client to subscribe to session events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute when a session event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the session event listener.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenSessionEvent("client-123", (event) => console.log(event));
 * // Logs each session event for "client-123"
 * unsubscribe(); // Stops listening
 */
declare const listenSessionEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to state-specific events on the swarm bus service for a specific client and executes a callback for each event.
 *
 * This function sets up a listener for events on the "state-bus" topic associated with a given client ID, invoking the provided callback with
 * the event data whenever a state event is received. It is wrapped in `beginContext` for a clean execution environment and logs the operation
 * via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing of events. The function supports a wildcard
 * client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop listening.
 *
 * @param {string} clientId - The ID of the client to subscribe to state events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute when a state event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the state event listener.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenStateEvent("client-123", (event) => console.log(event));
 * // Logs each state event for "client-123"
 * unsubscribe(); // Stops listening
 */
declare const listenStateEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to storage-specific events on the swarm bus service for a specific client and executes a callback for each event.
 *
 * This function sets up a listener for events on the "storage-bus" topic associated with a given client ID, invoking the provided callback with
 * the event data whenever a storage event is received. It is wrapped in `beginContext` for a clean execution environment and logs the operation
 * via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing of events. The function supports a wildcard
 * client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop listening.
 *
 * @param {string} clientId - The ID of the client to subscribe to storage events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute when a storage event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the storage event listener.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenStorageEvent("client-123", (event) => console.log(event));
 * // Logs each storage event for "client-123"
 * unsubscribe(); // Stops listening
 */
declare const listenStorageEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to swarm-specific events on the swarm bus service for a specific client and executes a callback for each event.
 *
 * This function sets up a listener for events on the "swarm-bus" topic associated with a given client ID, invoking the provided callback with
 * the event data whenever a swarm event is received. It is wrapped in `beginContext` for a clean execution environment and logs the operation
 * via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing of events. The function supports a wildcard
 * client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop listening.
 *
 * @param {string} clientId - The ID of the client to subscribe to swarm events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute when a swarm event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the swarm event listener.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenSwarmEvent("client-123", (event) => console.log(event));
 * // Logs each swarm event for "client-123"
 * unsubscribe(); // Stops listening
 */
declare const listenSwarmEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to execution-specific events on the swarm bus service for a specific client and executes a callback for each event.
 *
 * This function sets up a listener for events on the "execution-bus" topic associated with a given client ID, invoking the provided callback with
 * the event data whenever an execution event is received. It is wrapped in `beginContext` for a clean execution environment and logs the operation
 * via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing of events. The function supports a wildcard
 * client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop listening.
 *
 * @param {string} clientId - The ID of the client to subscribe to execution events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute when an execution event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the execution event listener.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenExecutionEvent("client-123", (event) => console.log(event));
 * // Logs each execution event for "client-123"
 * unsubscribe(); // Stops listening
 */
declare const listenExecutionEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to policy-specific events on the swarm bus service for a specific client and executes a callback for each event.
 *
 * This function sets up a listener for events on the "policy-bus" topic associated with a given client ID, invoking the provided callback with
 * the event data whenever a policy event is received. It is wrapped in `beginContext` for a clean execution environment and logs the operation
 * via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing of events. The function supports a wildcard
 * client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop listening.
 *
 * @param {string} clientId - The ID of the client to subscribe to policy events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute when a policy event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the policy event listener.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenPolicyEvent("client-123", (event) => console.log(event));
 * // Logs each policy event for "client-123"
 * unsubscribe(); // Stops listening
 */
declare const listenPolicyEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to a single agent-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "agent-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @param {string} clientId - The ID of the client to subscribe to agent events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute once when a matching agent event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the agent event listener before it triggers.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenAgentEventOnce(
 *   "client-123",
 *   (event) => event.type === "update",
 *   (event) => console.log(event)
 * );
 * // Logs the first "update" agent event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
declare const listenAgentEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to a single history-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "history-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @param {string} clientId - The ID of the client to subscribe to history events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute once when a matching history event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the history event listener before it triggers.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenHistoryEventOnce(
 *   "client-123",
 *   (event) => event.type === "update",
 *   (event) => console.log(event)
 * );
 * // Logs the first "update" history event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
declare const listenHistoryEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to a single session-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "session-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @param {string} clientId - The ID of the client to subscribe to session events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute once when a matching session event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the session event listener before it triggers.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenSessionEventOnce(
 *   "client-123",
 *   (event) => event.type === "start",
 *   (event) => console.log(event)
 * );
 * // Logs the first "start" session event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
declare const listenSessionEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to a single state-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "state-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @param {string} clientId - The ID of the client to subscribe to state events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute once when a matching state event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the state event listener before it triggers.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenStateEventOnce(
 *   "client-123",
 *   (event) => event.type === "change",
 *   (event) => console.log(event)
 * );
 * // Logs the first "change" state event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
declare const listenStateEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to a single storage-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "storage-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @param {string} clientId - The ID of the client to subscribe to storage events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute once when a matching storage event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the storage event listener before it triggers.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenStorageEventOnce(
 *   "client-123",
 *   (event) => event.type === "update",
 *   (event) => console.log(event)
 * );
 * // Logs the first "update" storage event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
declare const listenStorageEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to a single swarm-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "swarm-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @param {string} clientId - The ID of the client to subscribe to swarm events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute once when a matching swarm event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the swarm event listener before it triggers.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenSwarmEventOnce(
 *   "client-123",
 *   (event) => event.type === "sync",
 *   (event) => console.log(event)
 * );
 * // Logs the first "sync" swarm event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
declare const listenSwarmEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to a single execution-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "execution-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @param {string} clientId - The ID of the client to subscribe to execution events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute once when a matching execution event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the execution event listener before it triggers.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenExecutionEventOnce(
 *   "client-123",
 *   (event) => event.type === "complete",
 *   (event) => console.log(event)
 * );
 * // Logs the first "complete" execution event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
declare const listenExecutionEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Subscribes to a single policy-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "policy-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @param {string} clientId - The ID of the client to subscribe to policy events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute once when a matching policy event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the policy event listener before it triggers.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenPolicyEventOnce(
 *   "client-123",
 *   (event) => event.type === "enforce",
 *   (event) => console.log(event)
 * );
 * // Logs the first "enforce" policy event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
declare const listenPolicyEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/** @private Symbol for memoizing the waitForInit method in LoggerInstance */
declare const LOGGER_INSTANCE_WAIT_FOR_INIT: unique symbol;
/**
 * Callbacks for managing logger instance lifecycle and log events.
 * Used by LoggerInstance to hook into initialization, disposal, and logging operations.
 */
interface ILoggerInstanceCallbacks {
    /**
     * Called when the logger instance is initialized, typically during waitForInit.
     * @param clientId - The client ID associated with the logger instance.
     */
    onInit(clientId: string): void;
    /**
     * Called when the logger instance is disposed, cleaning up resources.
     * @param clientId - The client ID associated with the logger instance.
     */
    onDispose(clientId: string): void;
    /**
     * Called when a log message is recorded via the log method.
     * @param clientId - The client ID associated with the logger instance.
     * @param topic - The log topic or category.
     * @param args - Additional arguments to log.
     */
    onLog(clientId: string, topic: string, ...args: any[]): void;
    /**
     * Called when a debug message is recorded via the debug method.
     * @param clientId - The client ID associated with the logger instance.
     * @param topic - The debug topic or category.
     * @param args - Additional arguments to debug log.
     */
    onDebug(clientId: string, topic: string, ...args: any[]): void;
    /**
     * Called when an info message is recorded via the info method.
     * @param clientId - The client ID associated with the logger instance.
     * @param topic - The info topic or category.
     * @param args - Additional arguments to info log.
     */
    onInfo(clientId: string, topic: string, ...args: any[]): void;
}
/**
 * Interface for logger instances, extending the base ILogger with lifecycle methods.
 * Implemented by LoggerInstance for client-specific logging with initialization and disposal support.
 * @extends {ILogger}
 */
interface ILoggerInstance extends ILogger {
    /**
     * Initializes the logger instance, invoking the onInit callback if provided.
     * Ensures initialization is performed only once, supporting asynchronous setup.
     * @param initial - Whether this is the initial setup (affects caching behavior in LoggerUtils).
     * @returns A promise if initialization is asynchronous, or void if synchronous.
     */
    waitForInit(initial: boolean): Promise<void> | void;
    /**
     * Disposes of the logger instance, invoking the onDispose callback if provided.
     * Cleans up resources associated with the client ID.
     * @returns A promise if disposal is asynchronous, or void if synchronous.
     */
    dispose(): Promise<void> | void;
}
/**
 * Interface defining methods for interacting with a logger adapter.
 * Implemented by LoggerUtils to provide client-specific logging operations.
 */
interface ILoggerAdapter {
    /**
     * Logs a message for a client using the client-specific logger instance.
     * Ensures session validation and initialization before logging.
     * @param clientId - The client ID associated with the log.
     * @param topic - The log topic or category.
     * @param args - Additional arguments to log.
     * @returns A promise that resolves when the log is recorded.
     */
    log(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Logs a debug message for a client using the client-specific logger instance.
     * Ensures session validation and initialization before logging.
     * @param clientId - The client ID associated with the debug log.
     * @param topic - The debug topic or category.
     * @param args - Additional arguments to debug log.
     * @returns A promise that resolves when the debug message is recorded.
     */
    debug(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Logs an info message for a client using the client-specific logger instance.
     * Ensures session validation and initialization before logging.
     * @param clientId - The client ID associated with the info log.
     * @param topic - The info topic or category.
     * @param args - Additional arguments to info log.
     * @returns A promise that resolves when the info message is recorded.
     */
    info(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Disposes of the logger instance for a client, clearing it from the cache.
     * Ensures initialization before disposal.
     * @param clientId - The client ID to dispose.
     * @returns A promise that resolves when disposal is complete.
     */
    dispose(clientId: string): Promise<void>;
}
/**
 * Interface defining control methods for configuring logger behavior.
 * Implemented by LoggerUtils to manage common adapters, callbacks, and custom constructors.
 */
interface ILoggerControl {
    /**
     * Sets a common logger adapter for all logging operations via swarm.loggerService.
     * Overrides the default logger service behavior for centralized logging.
     * @param logger - The logger instance to set as the common adapter.
     */
    useCommonAdapter(logger: ILogger): void;
    /**
     * Configures client-specific lifecycle callbacks for logger instances.
     * Applies to all instances created by LoggerUtils' LoggerFactory.
     * @param Callbacks - The callbacks to configure.
     */
    useClientCallbacks(Callbacks: Partial<ILoggerInstanceCallbacks>): void;
    /**
     * Sets a custom logger instance constructor for client-specific logging.
     * Replaces the default LoggerInstance with a user-defined constructor.
     * @param Ctor - The constructor for creating logger instances.
     */
    useClientAdapter(Ctor: TLoggerInstanceCtor): void;
    /**
     * Logs a message for a specific client using the common adapter (swarm.loggerService).
     * Includes session validation and method context tracking.
     * @param clientId - The client ID associated with the log.
     * @param topic - The log topic or category.
     * @param args - Additional arguments to log.
     * @returns A promise that resolves when the log is recorded.
     */
    logClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Logs an info message for a specific client using the common adapter (swarm.loggerService).
     * Includes session validation and method context tracking.
     * @param clientId - The client ID associated with the info log.
     * @param topic - The info topic or category.
     * @param args - Additional arguments to info log.
     * @returns A promise that resolves when the info message is recorded.
     */
    infoClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Logs a debug message for a specific client using the common adapter (swarm.loggerService).
     * Includes session validation and method context tracking.
     * @param clientId - The client ID associated with the debug log.
     * @param topic - The debug topic or category.
     * @param args - Additional arguments to debug log.
     * @returns A promise that resolves when the debug message is recorded.
     */
    debugClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
}
/**
 * Constructor type for creating logger instances.
 * Used by LoggerUtils to instantiate custom or default LoggerInstance objects.
 */
type TLoggerInstanceCtor = new (clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>) => ILoggerInstance;
/**
 * Manages logging operations for a specific client, with customizable callbacks and console output.
 * Implements ILoggerInstance for client-specific logging with lifecycle management.
 * Integrates with GLOBAL_CONFIG for console logging control and callbacks for custom behavior.
 * @implements {ILoggerInstance}
 */
declare const LoggerInstance: {
    new (clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>): {
        readonly clientId: string;
        readonly callbacks: Partial<ILoggerInstanceCallbacks>;
        /**
         * Initializes the logger instance, invoking the onInit callback if provided.
         * Ensures initialization is performed only once, memoized via singleshot.
         * @param initial - Whether this is the initial setup (unused here but required by ILoggerInstance).
         * @returns A promise that resolves when initialization is complete.
         */
        waitForInit(): Promise<void>;
        /**
         * Logs a message to the console (if enabled) and invokes the onLog callback if provided.
         * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE for console output.
         * @param topic - The topic or category of the log message.
         * @param args - Additional arguments to include in the log.
         */
        log(topic: string, ...args: any[]): void;
        /**
         * Logs a debug message to the console (if enabled) and invokes the onDebug callback if provided.
         * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE for console output.
         * @param topic - The topic or category of the debug message.
         * @param args - Additional arguments to include in the debug log.
         */
        debug(topic: string, ...args: any[]): void;
        /**
         * Logs an info message to the console (if enabled) and invokes the onInfo callback if provided.
         * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE for console output.
         * @param topic - The topic or category of the info message.
         * @param args - Additional arguments to include in the info log.
         */
        info(topic: string, ...args: any[]): void;
        /**
         * Disposes of the logger instance, invoking the onDispose callback if provided.
         * Performs synchronous cleanup without additional resource management.
         * @returns No return value, operation is synchronous.
         */
        dispose(): void;
        /**
         * Memoized initialization function to ensure it runs only once using singleshot.
         * Invokes LOGGER_INSTANCE_WAIT_FOR_FN to handle onInit callback execution.
         * @private
         * @returns A promise that resolves when initialization is complete.
         */
        [LOGGER_INSTANCE_WAIT_FOR_INIT]: (() => Promise<void>) & functools_kit.ISingleshotClearable;
    };
};
/**
 * Type alias for an instance of LoggerInstance.
 */
type TLoggerInstance = InstanceType<typeof LoggerInstance>;
/**
 * Exported Logger Control interface for configuring logger behavior.
 * Exposes LoggerUtils' control methods (useCommonAdapter, useClientCallbacks, useClientAdapter, etc.).
 * @type {ILoggerControl}
 */
declare const Logger: ILoggerControl;

/**
 * Interface defining the global configuration settings and behaviors for the swarm system.
 * Centralizes constants and functions used across components like `ClientAgent` (e.g., tool handling, logging, history).
 * Influences workflows such as message processing (`CC_EMPTY_OUTPUT_PLACEHOLDERS` in `RUN_FN`), tool call recovery (`CC_RESQUE_STRATEGY` in `_resurrectModel`), and logging (`CC_LOGGER_ENABLE_DEBUG`).
 * Customizable via `setConfig` to adapt system behavior dynamically.
 */
interface IGlobalConfig {
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
    CC_AGENT_MAP_TOOLS: (tool: IToolCall[], clientId: string, agentName: AgentName) => IToolCall[] | Promise<IToolCall[]>;
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
    CC_GET_AGENT_HISTORY_ADAPTER: (clientId: string, agentName: AgentName) => IHistoryAdapter;
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
    CC_SWARM_AGENT_CHANGED: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void>;
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
    CC_SWARM_DEFAULT_AGENT: (clientId: string, swarmName: SwarmName, defaultAgent: AgentName) => Promise<AgentName>;
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
    CC_SWARM_DEFAULT_STACK: (clientId: string, swarmName: SwarmName) => Promise<AgentName[]>;
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
    CC_SWARM_STACK_CHANGED: (clientId: string, navigationStack: AgentName[], swarmName: SwarmName) => Promise<void>;
    /**
     * Default validation function for agent outputs, used in `ClientAgent.validate` (e.g., `RUN_FN`, `EXECUTE_FN`).
     * Imported from `validateDefault`, returns null if valid or an error string if invalid, ensuring output correctness.
     * @type {typeof validateDefault}
     */
    CC_AGENT_DEFAULT_VALIDATION: (output: string) => string | null | Promise<string | null>;
    /**
     * Filter function for agent history, used in `ClientAgent.history.toArrayForAgent` to scope messages.
     * Ensures only relevant messages (e.g., matching `agentName` for "tool" or `tool_calls`) are included in completions.
     * @param {AgentName} agentName - The agent name to filter by.
     * @returns {(message: IModelMessage) => boolean} A predicate function to filter `IModelMessage` objects.
     * @example
     * const filter = CC_AGENT_HISTORY_FILTER("agent1");
     * const isRelevant = filter({ role: "tool", agentName: "agent1" }); // true
     */
    CC_AGENT_HISTORY_FILTER: (agentName: AgentName) => (message: IModelMessage) => boolean;
    /**
     * Default transformation function for agent outputs, used in `ClientAgent.transform` (e.g., `RUN_FN`, `_emitOutput`).
     * Removes XML tags via `removeXmlTags` based on `CC_AGENT_DISALLOWED_TAGS` to clean responses for consistency.
     * @type {typeof removeXmlTags}
     */
    CC_AGENT_OUTPUT_TRANSFORM: (input: string, clientId: string, agentName: AgentName) => Promise<string> | string;
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
    CC_AGENT_OUTPUT_MAP: (message: IModelMessage) => IModelMessage | Promise<IModelMessage>;
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
    CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: (clientId: string, agentName: AgentName) => Promise<IModelMessage | null>;
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
    CC_DEFAULT_STATE_SET: <T = any>(state: T, clientId: string, stateName: StateName) => Promise<void>;
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
    CC_DEFAULT_STATE_GET: <T = any>(clientId: string, stateName: StateName, defaultState: T) => Promise<T>;
    /**
     * Default function to get banned clients for the policy
     * @param {PolicyName} policyName - The policy identifier.
     * @param {SwarmName} swarmName - The swarm identifier.
     * @example
     * setConfig({
     *   CC_DEFAULT_POLICY_GET_BAN_CLIENTS: async () => []
     * });
     */
    CC_DEFAULT_POLICY_GET_BAN_CLIENTS: (policyName: PolicyName, swarmName: SwarmName) => Promise<SessionId[]> | SessionId[];
    /**
     * Retrieves the list of currently banned clients under this policy.
     * @param {PolicyName} policyName - The unique name of the policy.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {SessionId[] | Promise<SessionId[]>} An array of banned session IDs, synchronously or asynchronously.
     */
    CC_DEFAULT_POLICY_GET?: (policyName: PolicyName, swarmName: SwarmName) => SessionId[] | Promise<SessionId[]>;
    /**
     * Optional function to set the list of banned clients.
     * Overrides default ban list management if provided.
     * @param {SessionId[]} clientIds - An array of session IDs to ban.
     * @param {PolicyName} policyName - The unique name of the policy.
     * @param {SwarmName} swarmName - The unique name of the swarm.
     * @returns {Promise<void> | void} A promise that resolves when the ban list is updated, or void if synchronous.
     * @throws {Error} If updating the ban list fails (e.g., due to persistence issues).
     */
    CC_DEFAULT_POLICY_SET?: (clientIds: SessionId[], policyName: PolicyName, swarmName: SwarmName) => Promise<void> | void;
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
    CC_DEFAULT_STORAGE_GET: <T extends IStorageData = IStorageData>(clientId: string, storageName: StorageName, defaultValue: T[]) => Promise<T[]>;
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
    CC_DEFAULT_STORAGE_SET: <T extends IStorageData = IStorageData>(data: T[], clientId: string, storageName: StorageName) => Promise<void>;
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
}

declare const GLOBAL_CONFIG: IGlobalConfig;
declare const setConfig: (config: Partial<IGlobalConfig>) => void;

/**
 * Utility class providing methods to manage client bans within a swarm policy context.
 * All methods validate inputs and execute within a context for logging and tracking.
 */
declare class PolicyUtils {
    /**
     * Bans a client under a specific policy within a swarm.
     * Validates the client, swarm, and policy before delegating to the policy service.
     * @param {Object} payload - The payload containing ban details.
     * @param {string} payload.clientId - The client ID to ban.
     * @param {SwarmName} payload.swarmName - The name of the swarm.
     * @param {PolicyName} payload.policyName - The name of the policy to enforce the ban.
     * @returns {Promise<void>} A promise that resolves when the ban is applied.
     * @throws {Error} If validation fails or the policy service encounters an error.
     */
    banClient: (payload: {
        clientId: string;
        swarmName: SwarmName;
        policyName: PolicyName;
    }) => Promise<void>;
    /**
     * Unbans a client under a specific policy within a swarm.
     * Validates the client, swarm, and policy before delegating to the policy service.
     * @param {Object} payload - The payload containing unban details.
     * @param {string} payload.clientId - The client ID to unban.
     * @param {SwarmName} payload.swarmName - The name of the swarm.
     * @param {PolicyName} payload.policyName - The name of the policy to lift the ban from.
     * @returns {Promise<void>} A promise that resolves when the unban is applied.
     * @throws {Error} If validation fails or the policy service encounters an error.
     */
    unbanClient: (payload: {
        clientId: string;
        swarmName: SwarmName;
        policyName: PolicyName;
    }) => Promise<void>;
    /**
     * Checks if a client is banned under a specific policy within a swarm.
     * Validates the client, swarm, and policy before querying the policy service.
     * @param {Object} payload - The payload containing ban check details.
     * @param {string} payload.clientId - The client ID to check.
     * @param {SwarmName} payload.swarmName - The name of the swarm.
     * @param {PolicyName} payload.policyName - The name of the policy to check against.
     * @returns {Promise<boolean>} A promise resolving to true if the client is banned, false otherwise.
     * @throws {Error} If validation fails or the policy service encounters an error.
     */
    hasBan: (payload: {
        clientId: string;
        swarmName: SwarmName;
        policyName: PolicyName;
    }) => Promise<boolean>;
}
/**
 * Singleton instance of PolicyUtils for managing client bans and policy enforcement.
 * @type {PolicyUtils}
 */
declare const Policy: PolicyUtils;

/**
 * Type definition for a state object, mapping IState keys to unknown values.
 * @typedef {{ [key in keyof IState]: unknown }} TState
 */
type TState = {
    [key in keyof IState]: unknown;
};
/**
 * Utility class for managing client-specific state within an agent swarm.
 * Provides methods to get, set, and clear state data for specific clients, agents, and state names,
 * interfacing with the swarm's state service and enforcing agent-state registration.
 * @implements {TState}
 */
declare class StateUtils implements TState {
    /**
     * Retrieves the state data for a given client, agent, and state name.
     * Validates the client session and agent-state registration before querying the state service.
     * Executes within a context for logging.
     * @template T - The type of the state data to retrieve, defaults to any.
     * @param {Object} payload - The payload containing client, agent, and state information.
     * @param {string} payload.clientId - The ID of the client whose state is being retrieved.
     * @param {AgentName} payload.agentName - The name of the agent associated with the state.
     * @param {StateName} payload.stateName - The name of the state to retrieve.
     * @returns {Promise<T>} A promise resolving to the state data associated with the client and state name.
     * @throws {Error} If the client session is invalid, the state is not registered in the agent, or the state service encounters an error.
     */
    getState: <T extends unknown = any>(payload: {
        clientId: string;
        agentName: AgentName;
        stateName: StateName;
    }) => Promise<T>;
    /**
     * Sets the state data for a given client, agent, and state name.
     * Accepts either a direct value or a function that computes the new state based on the previous state.
     * Validates the client session and agent-state registration before updating via the state service.
     * Executes within a context for logging.
     * @template T - The type of the state data to set, defaults to any.
     * @param {T | ((prevState: T) => Promise<T>)} dispatchFn - The new state value or an async function that takes the previous state and returns the new state.
     * @param {Object} payload - The payload containing client, agent, and state information.
     * @param {string} payload.clientId - The ID of the client whose state is being updated.
     * @param {AgentName} payload.agentName - The name of the agent associated with the state.
     * @param {StateName} payload.stateName - The name of the state to update.
     * @returns {Promise<void>} A promise that resolves when the state is successfully updated.
     * @throws {Error} If the client session is invalid, the state is not registered in the agent, or the state service encounters an error.
     */
    setState: <T extends unknown = any>(dispatchFn: T | ((prevState: T) => Promise<T>), payload: {
        clientId: string;
        agentName: AgentName;
        stateName: StateName;
    }) => Promise<void>;
    /**
     * Clears the state data for a given client, agent, and state name, resetting it to its initial value.
     * Validates the client session and agent-state registration before clearing via the state service.
     * Executes within a context for logging.
     * @template T - The type of the state data, defaults to any (unused in return).
     * @param {Object} payload - The payload containing client, agent, and state information.
     * @param {string} payload.clientId - The ID of the client whose state is being cleared.
     * @param {AgentName} payload.agentName - The name of the agent associated with the state.
     * @param {StateName} payload.stateName - The name of the state to clear.
     * @returns {Promise<void>} A promise that resolves when the state is successfully cleared.
     * @throws {Error} If the client session is invalid, the state is not registered in the agent, or the state service encounters an error.
     */
    clearState: <T extends unknown = any>(payload: {
        clientId: string;
        agentName: AgentName;
        stateName: StateName;
    }) => Promise<T>;
}
/**
 * Singleton instance of StateUtils for managing client-specific state operations.
 * @type {StateUtils}
 */
declare const State: StateUtils;

/**
 * Type definition for a shared state object, mapping IState keys to unknown values.
 * @typedef {{ [key in keyof IState]: unknown }} TSharedState
 */
type TSharedState = {
    [key in keyof IState]: unknown;
};
/**
 * Utility class for managing shared state within an agent swarm.
 * Provides methods to get, set, and clear state data for specific state names, interfacing with the swarm's shared state service.
 * @implements {TSharedState}
 */
declare class SharedStateUtils implements TSharedState {
    /**
     * Retrieves the shared state data for a given state name.
     * Executes within a context for logging and delegates to the shared state service.
     * @template T - The type of the state data to retrieve, defaults to any.
     * @param {StateName} stateName - The name of the state to retrieve.
     * @returns {Promise<T>} A promise resolving to the state data associated with the state name.
     * @throws {Error} If the state name is not registered in the agent or the shared state service encounters an error.
     */
    getState: <T extends unknown = any>(stateName: StateName) => Promise<T>;
    /**
     * Sets the shared state data for a given state name.
     * Accepts either a direct value or a function that computes the new state based on the previous state.
     * Executes within a context for logging and delegates to the shared state service.
     * @template T - The type of the state data to set, defaults to any.
     * @param {T | ((prevSharedState: T) => Promise<T>)} dispatchFn - The new state value or an async function that takes the previous state and returns the new state.
     * @param {StateName} stateName - The name of the state to update.
     * @returns {Promise<void>} A promise that resolves when the state is successfully updated.
     * @throws {Error} If the state name is not registered in the agent or the shared state service encounters an error.
     */
    setState: <T extends unknown = any>(dispatchFn: T | ((prevSharedState: T) => Promise<T>), stateName: StateName) => Promise<void>;
    /**
     * Clears the shared state for a given state name, resetting it to its initial value.
     * Executes within a context for logging and delegates to the shared state service.
     * @template T - The type of the state data, defaults to any (unused in return).
     * @param {StateName} stateName - The name of the state to clear.
     * @returns {Promise<void>} A promise that resolves when the state is successfully cleared.
     * @throws {Error} If the state name is not registered in the agent or the shared state service encounters an error.
     */
    clearState: <T extends unknown = any>(stateName: StateName) => Promise<T>;
}
/**
 * Singleton instance of SharedStateUtils for managing shared state operations.
 * @type {SharedStateUtils}
 */
declare const SharedState: SharedStateUtils;

/**
 * Type definition for a storage object, mapping IStorage keys to unknown values.
 * @typedef {{ [key in keyof IStorage]: unknown }} TStorage
 */
type TStorage = {
    [key in keyof IStorage]: unknown;
};
/**
 * Utility class for managing client-specific storage within an agent swarm.
 * Provides methods to manipulate and query storage data for specific clients, agents, and storage names,
 * interfacing with the swarm's storage service and enforcing agent-storage registration.
 * @implements {TStorage}
 */
declare class StorageUtils implements TStorage {
    /**
     * Retrieves a specified number of items from storage matching a search query for a given client and agent.
     * Validates the client session, storage name, and agent-storage registration before querying the storage service.
     * Executes within a context for logging.
     * @template T - The type of the storage data items, defaults to IStorageData.
     * @param {Object} payload - The payload containing search, client, agent, and storage details.
     * @param {string} payload.search - The search query to filter items.
     * @param {number} payload.total - The maximum number of items to retrieve.
     * @param {string} payload.clientId - The ID of the client whose storage is being queried.
     * @param {AgentName} payload.agentName - The name of the agent associated with the storage.
     * @param {StorageName} payload.storageName - The name of the storage to query.
     * @param {number} [payload.score] - Optional relevance score threshold for filtering items.
     * @returns {Promise<T[]>} A promise resolving to an array of matching storage items.
     * @throws {Error} If the client session is invalid, storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
     */
    take: <T extends IStorageData = IStorageData>(payload: {
        search: string;
        total: number;
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
        score?: number;
    }) => Promise<T[]>;
    /**
     * Inserts or updates an item in the storage for a given client and agent.
     * Validates the client session, storage name, and agent-storage registration before updating via the storage service.
     * Executes within a context for logging.
     * @template T - The type of the storage data item, defaults to IStorageData.
     * @param {Object} payload - The payload containing item, client, agent, and storage details.
     * @param {T} payload.item - The item to upsert into the storage.
     * @param {string} payload.clientId - The ID of the client whose storage is being updated.
     * @param {AgentName} payload.agentName - The name of the agent associated with the storage.
     * @param {StorageName} payload.storageName - The name of the storage to update.
     * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
     * @throws {Error} If the client session is invalid, storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
     */
    upsert: <T extends IStorageData = IStorageData>(payload: {
        item: T;
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
    }) => Promise<void>;
    /**
     * Removes an item from the storage by its ID for a given client and agent.
     * Validates the client session, storage name, and agent-storage registration before removing via the storage service.
     * Executes within a context for logging.
     * @param {Object} payload - The payload containing item ID, client, agent, and storage details.
     * @param {IStorageData["id"]} payload.itemId - The ID of the item to remove.
     * @param {string} payload.clientId - The ID of the client whose storage is being modified.
     * @param {AgentName} payload.agentName - The name of the agent associated with the storage.
     * @param {StorageName} payload.storageName - The name of the storage to modify.
     * @returns {Promise<void>} A promise that resolves when the removal operation is complete.
     * @throws {Error} If the client session is invalid, storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
     */
    remove: (payload: {
        itemId: IStorageData["id"];
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
    }) => Promise<void>;
    /**
     * Retrieves an item from the storage by its ID for a given client and agent.
     * Validates the storage name and agent-storage registration before querying the storage service.
     * Executes within a context for logging.
     * @template T - The type of the storage data item, defaults to IStorageData.
     * @param {Object} payload - The payload containing item ID, client, agent, and storage details.
     * @param {IStorageData["id"]} payload.itemId - The ID of the item to retrieve.
     * @param {string} payload.clientId - The ID of the client whose storage is being queried.
     * @param {AgentName} payload.agentName - The name of the agent associated with the storage.
     * @param {StorageName} payload.storageName - The name of the storage to query.
     * @returns {Promise<T | null>} A promise resolving to the item if found, or null if not found.
     * @throws {Error} If storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
     */
    get: <T extends IStorageData = IStorageData>(payload: {
        itemId: IStorageData["id"];
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
    }) => Promise<T | null>;
    /**
     * Lists all items in the storage for a given client and agent, optionally filtered by a predicate.
     * Validates the storage name and agent-storage registration before querying the storage service.
     * Executes within a context for logging.
     * @template T - The type of the storage data items, defaults to IStorageData.
     * @param {Object} payload - The payload containing client, agent, and storage details.
     * @param {string} payload.clientId - The ID of the client whose storage is being queried.
     * @param {AgentName} payload.agentName - The name of the agent associated with the storage.
     * @param {StorageName} payload.storageName - The name of the storage to query.
     * @param {(item: T) => boolean} [payload.filter] - Optional function to filter items; only items returning true are included.
     * @returns {Promise<T[]>} A promise resolving to an array of storage items.
     * @throws {Error} If storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
     */
    list: <T extends IStorageData = IStorageData>(payload: {
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
        filter?: (item: T) => boolean;
    }) => Promise<T[]>;
    /**
     * Clears all items from the storage for a given client and agent.
     * Validates the storage name and agent-storage registration before clearing via the storage service.
     * Executes within a context for logging.
     * @param {Object} payload - The payload containing client, agent, and storage details.
     * @param {string} payload.clientId - The ID of the client whose storage is being cleared.
     * @param {AgentName} payload.agentName - The name of the agent associated with the storage.
     * @param {StorageName} payload.storageName - The name of the storage to clear.
     * @returns {Promise<void>} A promise that resolves when the clear operation is complete.
     * @throws {Error} If storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
     */
    clear: (payload: {
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
    }) => Promise<void>;
}
/**
 * Singleton instance of StorageUtils for managing client-specific storage operations.
 * @type {StorageUtils}
 */
declare const Storage: StorageUtils;

/**
 * Type definition for a shared storage object, mapping IStorage keys to unknown values.
 * @typedef {{ [key in keyof IStorage]: unknown }} TSharedStorage
 */
type TSharedStorage = {
    [key in keyof IStorage]: unknown;
};
/**
 * Utility class for managing shared storage within an agent swarm.
 * Provides methods to manipulate and query storage data, interfacing with the swarm's shared storage service.
 * @implements {TSharedStorage}
 */
declare class SharedStorageUtils implements TSharedStorage {
    /**
     * Retrieves a specified number of items from storage matching a search query.
     * Executes within a context for logging and validation, ensuring the storage name is valid.
     * @template T - The type of the storage data items, defaults to IStorageData.
     * @param {Object} payload - The payload containing search and storage details.
     * @param {string} payload.search - The search query to filter items.
     * @param {number} payload.total - The maximum number of items to retrieve.
     * @param {StorageName} payload.storageName - The name of the storage to query.
     * @param {number} [payload.score] - Optional relevance score threshold for filtering items.
     * @returns {Promise<T[]>} A promise resolving to an array of matching storage items.
     * @throws {Error} If storage validation fails or the shared storage service encounters an error.
     */
    take: <T extends IStorageData = IStorageData>(payload: {
        search: string;
        total: number;
        storageName: StorageName;
        score?: number;
    }) => Promise<T[]>;
    /**
     * Inserts or updates an item in the storage.
     * Executes within a context for logging and validation, ensuring the storage name is valid.
     * @template T - The type of the storage data item, defaults to IStorageData.
     * @param {T} item - The item to upsert into the storage.
     * @param {StorageName} storageName - The name of the storage to update.
     * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
     * @throws {Error} If storage validation fails or the shared storage service encounters an error.
     */
    upsert: <T extends IStorageData = IStorageData>(item: T, storageName: StorageName) => Promise<void>;
    /**
     * Removes an item from the storage by its ID.
     * Executes within a context for logging and validation, ensuring the storage name is valid.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @param {StorageName} storageName - The name of the storage to modify.
     * @returns {Promise<void>} A promise that resolves when the removal operation is complete.
     * @throws {Error} If storage validation fails or the shared storage service encounters an error.
     */
    remove: (itemId: IStorageData["id"], storageName: StorageName) => Promise<void>;
    /**
     * Retrieves an item from the storage by its ID.
     * Executes within a context for logging and validation, ensuring the storage name is valid.
     * @template T - The type of the storage data item, defaults to IStorageData.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
     * @param {StorageName} storageName - The name of the storage to query.
     * @returns {Promise<T | null>} A promise resolving to the item if found, or null if not found.
     * @throws {Error} If storage validation fails or the shared storage service encounters an error.
     */
    get: <T extends IStorageData = IStorageData>(itemId: IStorageData["id"], storageName: StorageName) => Promise<T | null>;
    /**
     * Lists all items in the storage, optionally filtered by a predicate.
     * Executes within a context for logging and validation, ensuring the storage name is valid.
     * @template T - The type of the storage data items, defaults to IStorageData.
     * @param {StorageName} storageName - The name of the storage to query.
     * @param {(item: T) => boolean} [filter] - Optional function to filter items; only items returning true are included.
     * @returns {Promise<T[]>} A promise resolving to an array of storage items.
     * @throws {Error} If storage validation fails or the shared storage service encounters an error.
     */
    list: <T extends IStorageData = IStorageData>(storageName: StorageName, filter?: (item: T) => boolean) => Promise<T[]>;
    /**
     * Clears all items from the storage.
     * Executes within a context for logging and validation, ensuring the storage name is valid.
     * @param {StorageName} storageName - The name of the storage to clear.
     * @returns {Promise<void>} A promise that resolves when the clear operation is complete.
     * @throws {Error} If storage validation fails or the shared storage service encounters an error.
     */
    clear: (storageName: string) => Promise<void>;
}
/**
 * Singleton instance of SharedStorageUtils for managing shared storage operations.
 * @type {SharedStorageUtils}
 */
declare const SharedStorage: SharedStorageUtils;

/**
 * Utility class for managing schema-related operations, including session memory access and data serialization.
 * Provides methods to read/write client session memory and serialize objects into formatted strings.
 */
declare class SchemaUtils {
    /**
     * Writes a value to the session memory for a given client.
     * Executes within a context for logging and validation, ensuring the client session is valid.
     * @template T - The type of the value to write, must extend object.
     * @param {string} clientId - The ID of the client whose session memory will be updated.
     * @param {T} value - The value to write to the session memory, typically an object.
     * @returns {T} The value written to the session memory, as returned by the memory schema service.
     * @throws {Error} If session validation fails or the memory schema service encounters an error.
     */
    writeSessionMemory: <T extends object = object>(clientId: string, value: T) => Promise<T>;
    /**
     * Reads a value from the session memory for a given client.
     * Executes within a context for logging and validation, ensuring the client session is valid.
     * @template T - The type of the value to read, must extend object.
     * @param {string} clientId - The ID of the client whose session memory will be read.
     * @returns {T} The value read from the session memory, as returned by the memory schema service.
     * @throws {Error} If session validation fails or the memory schema service encounters an error.
     */
    readSessionMemory: <T extends object = object>(clientId: string) => Promise<T>;
    /**
     * Serializes an object or array of objects into a formatted string.
     * Flattens nested objects and applies optional key/value mapping functions for formatting.
     * @template T - The type of the object(s) to serialize, defaults to any.
     * @param {T[] | T} data - The data to serialize, either a single object or an array of objects.
     * @param {Object} [map] - Optional configuration for mapping keys and values.
     * @param {(key: string) => string} [map.mapKey=GLOBAL_CONFIG.CC_NAME_TO_TITLE] - Function to transform property keys.
     * @param {(key: string, value: string) => string} [map.mapValue] - Function to transform property values, defaults to truncating at 50 characters.
     * @returns {string} A formatted string representation of the data, with key-value pairs separated by newlines.
     */
    serialize: <T extends object = any>(data: T[] | T, map?: {
        mapKey?: typeof GLOBAL_CONFIG.CC_NAME_TO_TITLE;
        mapValue?: (key: string, value: string) => string;
    }) => string;
}
/**
 * Singleton instance of SchemaUtils for managing schema operations.
 * @type {SchemaUtils}
 */
declare const Schema: SchemaUtils;

/**
 * Type definition for a function that handles completion requests to an AI provider.
 * @callback TCompleteFn
 * @param {ICompletionArgs} args - The arguments for the completion request.
 * @returns {Promise<IModelMessage>} The response from the completion endpoint in `agent-swarm-kit` format.
 */
type TCompleteFn = (args: ICompletionArgs) => Promise<IModelMessage>;
/**
 * Utility class providing adapter functions for interacting with various AI completion providers.
 */
declare class AdapterUtils {
    /**
     * Creates a function to interact with OpenAI's chat completions API.
     * @param {any} openai - The OpenAI client instance.
     * @param {string} [model="gpt-3.5-turbo"] - The model to use for completions (defaults to "gpt-3.5-turbo").
     * @param {{ type: string }} [response_format] - Optional response format configuration (e.g., `{ type: "json_object" }`).
     * @returns {TCompleteFn} A function that processes completion arguments and returns a response from OpenAI.
     */
    fromOpenAI: (openai: any, model?: string, response_format?: {
        type: string;
    }) => TCompleteFn;
    /**
     * Creates a function to interact with LMStudio's chat completions API.
     * @param {any} openai - The LMStudio client instance (compatible with OpenAI-style API).
     * @param {string} [model="saiga_yandexgpt_8b_gguf"] - The model to use for completions (defaults to "saiga_yandexgpt_8b_gguf").
     * @param {{ type: string }} [response_format] - Optional response format configuration (e.g., `{ type: "json_object" }`).
     * @returns {TCompleteFn} A function that processes completion arguments and returns a response from LMStudio.
     */
    fromLMStudio: (openai: any, model?: string, response_format?: {
        type: string;
    }) => TCompleteFn;
    /**
     * Creates a function to interact with Ollama's chat completions API.
     * @param {any} ollama - The Ollama client instance.
     * @param {string} [model="nemotron-mini:4b"] - The model to use for completions (defaults to "nemotron-mini:4b").
     * @param {string} [tool_call_protocol=TOOL_PROTOCOL_PROMPT] - The protocol prompt for tool calls (defaults to TOOL_PROTOCOL_PROMPT).
     * @returns {TCompleteFn} A function that processes completion arguments and returns a response from Ollama.
     */
    fromOllama: (ollama: any, model?: string, tool_call_protocol?: string) => TCompleteFn;
}
/**
 * Singleton instance of AdapterUtils for interacting with AI completion providers.
 * @type {AdapterUtils}
 */
declare const Adapter: AdapterUtils;

/**
 * A higher-order function that ensures a provided function executes outside of existing method and execution contexts.
 * Wraps the input function to isolate its execution from any active `MethodContextService` or `ExecutionContextService` contexts,
 * using `AsyncResource` to create a new, untracked async scope when necessary.
 *
 * @template T - The type of the function to be wrapped, extending any function with arbitrary arguments and return type.
 * @param {T} run - The function to execute outside of existing contexts.
 * @returns {(...args: Parameters<T>) => ReturnType<T>} A wrapped function that preserves the original function's signature
 *   and executes it outside of any existing contexts if detected, otherwise runs it directly.
 * @throws {any} Propagates any errors thrown by the wrapped `run` function during execution.
 *
 * @example
 * // Basic usage with a simple logging function
 * const logMessage = (message: string) => console.log(message);
 * const safeLog = beginContext(logMessage);
 * safeLog("Hello, world!"); // Logs "Hello, world!" outside any existing contexts
 *
 * @example
 * // Usage with an async function
 * const fetchData = async (id: number) => {
 *   const response = await fetch(`https://api.example.com/data/${id}`);
 *   return response.json();
 * };
 * const safeFetch = beginContext(fetchData);
 * safeFetch(42).then(data => console.log(data)); // Fetches data in a clean context
 *
 * @remarks
 * This utility leverages `AsyncResource` from Node.js’s `async_hooks` to create a new async scope when either
 * `MethodContextService.hasContext()` or `ExecutionContextService.hasContext()` returns true. This ensures the
 * wrapped function runs in an isolated environment, free from inherited context state, which is critical for operations
 * requiring a clean slate (e.g., resetting tracking in the agent swarm system). If no contexts are active, the function
 * executes directly without overhead. The `resource.emitDestroy()` call ensures proper cleanup of the async resource.
 *
 * @see {@link MethodContextService} for details on method-level context tracking.
 * @see {@link ExecutionContextService} for details on execution-level context tracking.
 * @see {@link https://nodejs.org/api/async_hooks.html#class-asyncresource|Node.js AsyncResource} for underlying mechanics.
 */
declare const beginContext: <T extends (...args: any[]) => any>(run: T) => ((...args: Parameters<T>) => ReturnType<T>);

declare const Utils: {
    PersistStateUtils: typeof PersistStateUtils;
    PersistSwarmUtils: typeof PersistSwarmUtils;
    PersistStorageUtils: typeof PersistStorageUtils;
    PersistMemoryUtils: typeof PersistMemoryUtils;
    PersistAliveUtils: typeof PersistAliveUtils;
    PersistPolicyUtils: typeof PersistPolicyUtils;
};

export { Adapter, type EventSource, ExecutionContextService, History, HistoryMemoryInstance, HistoryPersistInstance, type IAgentSchema, type IAgentTool, type IBaseEvent, type IBusEvent, type IBusEventContext, type ICompletionArgs, type ICompletionSchema, type ICustomEvent, type IEmbeddingSchema, type IGlobalConfig, type IHistoryAdapter, type IHistoryControl, type IHistoryInstance, type IHistoryInstanceCallbacks, type IIncomingMessage, type ILoggerAdapter, type ILoggerInstance, type ILoggerInstanceCallbacks, type IMakeConnectionConfig, type IMakeDisposeParams, type IModelMessage, type IOutgoingMessage, type IPersistBase, type IPolicySchema, type ISessionConfig, type IStateSchema, type IStorageSchema, type ISwarmSchema, type ITool, type IToolCall, Logger, LoggerInstance, MethodContextService, PayloadContextService, PersistAlive, PersistBase, PersistList, PersistMemory, PersistPolicy, PersistState, PersistStorage, PersistSwarm, Policy, type ReceiveMessageFn, Schema, type SendMessageFn, SharedState, SharedStorage, State, Storage, type THistoryInstanceCtor, type THistoryMemoryInstance, type THistoryPersistInstance, type TLoggerInstance, type TPersistBase, type TPersistBaseCtor, type TPersistList, Utils, addAgent, addCompletion, addEmbedding, addPolicy, addState, addStorage, addSwarm, addTool, beginContext, cancelOutput, cancelOutputForce, changeToAgent, changeToDefaultAgent, changeToPrevAgent, commitAssistantMessage, commitAssistantMessageForce, commitFlush, commitFlushForce, commitStopTools, commitStopToolsForce, commitSystemMessage, commitSystemMessageForce, commitToolOutput, commitToolOutputForce, commitUserMessage, commitUserMessageForce, complete, disposeConnection, dumpAgent, dumpClientPerformance, dumpDocs, dumpPerfomance, dumpSwarm, emit, emitForce, event, execute, executeForce, getAgentHistory, getAgentName, getAssistantHistory, getLastAssistantMessage, getLastSystemMessage, getLastUserMessage, getPayload, getRawHistory, getSessionContext, getSessionMode, getUserHistory, listenAgentEvent, listenAgentEventOnce, listenEvent, listenEventOnce, listenExecutionEvent, listenExecutionEventOnce, listenHistoryEvent, listenHistoryEventOnce, listenPolicyEvent, listenPolicyEventOnce, listenSessionEvent, listenSessionEventOnce, listenStateEvent, listenStateEventOnce, listenStorageEvent, listenStorageEventOnce, listenSwarmEvent, listenSwarmEventOnce, makeAutoDispose, makeConnection, markOffline, markOnline, runStateless, runStatelessForce, session, setConfig, swarm };
