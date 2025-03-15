import * as di_scoped from 'di-scoped';
import * as functools_kit from 'functools-kit';
import { SortedArray, Subject } from 'functools-kit';

/**
 * Interface representing the context.
 */
interface IExecutionContext {
    clientId: string;
    executionId: string;
    processId: string;
}
/**
 * Service providing execution context information.
 */
declare const ExecutionContextService: (new () => {
    readonly context: IExecutionContext;
}) & Omit<{
    new (context: IExecutionContext): {
        readonly context: IExecutionContext;
    };
}, "prototype"> & di_scoped.IScopedClassRun<[context: IExecutionContext]>;

/**
 * Interface representing an incoming message.
 */
interface IIncomingMessage {
    /**
     * The ID of the client sending the message.
     */
    clientId: string;
    /**
     * The data contained in the message.
     */
    data: string;
    /**
     * The name of the agent sending the message.
     */
    agentName: AgentName;
}
/**
 * Interface representing an outgoing message.
 */
interface IOutgoingMessage {
    /**
     * The ID of the client receiving the message.
     */
    clientId: string;
    /**
     * The data contained in the message.
     */
    data: string;
    /**
     * The name of the agent sending the message.
     */
    agentName: AgentName;
}

/**
 * ILogger interface for logging messages.
 */
interface ILogger {
    /**
     * Logs a message.
     * @param {...any[]} args - The message or messages to log.
     */
    log(topic: string, ...args: any[]): void;
    /**
     * Logs a debug message.
     * @param {...any[]} args - The debug message or messages to log.
     */
    debug(topic: string, ...args: any[]): void;
    /**
     * Logs a info message.
     * @param {...any[]} args - The debug message or messages to log.
     */
    info(topic: string, ...args: any[]): void;
}

/**
 * Type representing an array of numbers as embeddings.
 */
type Embeddings = number[];
/**
 * Interface for embedding callbacks.
 */
interface IEmbeddingCallbacks {
    /**
     * Callback for when an embedding is created.
     * @param text - The text used to create the embedding.
     * @param embeddings - The generated embeddings.
     * @param clientId - The client ID associated with the embedding.
     * @param embeddingName - The name of the embedding.
     */
    onCreate(text: string, embeddings: Embeddings, clientId: string, embeddingName: EmbeddingName): void;
    /**
     * Callback for when embeddings are compared.
     * @param text1 - The first text used in the comparison.
     * @param text2 - The second text used in the comparison.
     * @param similarity - The similarity score between the embeddings.
     * @param clientId - The client ID associated with the comparison.
     * @param embeddingName - The name of the embedding.
     */
    onCompare(text1: string, text2: string, similarity: number, clientId: string, embeddingName: EmbeddingName): void;
}
/**
 * Interface representing the schema for embeddings.
 */
interface IEmbeddingSchema {
    /**
     * The name of the embedding.
     */
    embeddingName: EmbeddingName;
    /**
     * Creates an embedding from the given text.
     * @param text - The text to create the embedding from.
     * @returns A promise that resolves to the generated embeddings.
     */
    createEmbedding(text: string): Promise<Embeddings>;
    /**
     * Calculates the similarity between two embeddings.
     * @param a - The first embedding.
     * @param b - The second embedding.
     * @returns A promise that resolves to the similarity score.
     */
    calculateSimilarity(a: Embeddings, b: Embeddings): Promise<number>;
    /**
     * Optional callbacks for embedding events.
     */
    callbacks?: Partial<IEmbeddingCallbacks>;
}
/**
 * Type representing the name of an embedding.
 */
type EmbeddingName = string;

type StorageId = string | number;
/**
 * Interface representing the data stored in the storage.
 */
interface IStorageData {
    id: StorageId;
}
/**
 * Interface representing the schema of the storage.
 * @template T - Type of the storage data.
 */
interface IStorageSchema<T extends IStorageData = IStorageData> {
    /** Mark the storage to serialize values to the hard drive */
    persist?: boolean;
    /** The description for documentation */
    docDescription?: string;
    /**
     * All agents will share the same ClientStorage instance
     */
    shared?: boolean;
    /**
     * Function to get data from the storage.
     * @param clientId - The client ID.
     * @param storageName - The name of the storage.
     * @returns A promise that resolves to an array of storage data or an array of storage data.
     */
    getData?: (clientId: string, storageName: StorageName, defaultValue: T[]) => Promise<T[]> | T[];
    /**
     * Function to set data from the storage to hard drive.
     * @param clientId - The client ID.
     * @param storageName - The name of the storage.
     * @returns A promise that resolves to an array of storage data or an array of storage data.
     */
    setData?: (data: T[], clientId: string, storageName: StorageName) => Promise<void> | void;
    /**
     * Function to create an index for an item.
     * @param item - The item to index.
     * @returns A promise that resolves to a string or a string.
     */
    createIndex(item: T): Promise<string> | string;
    /**
     * The name of the embedding.
     */
    embedding: EmbeddingName;
    /**
     * The name of the storage.
     */
    storageName: StorageName;
    /**
     * Optional callbacks for storage events.
     */
    callbacks?: Partial<IStorageCallbacks<T>>;
    /**
     * The default value. Resolved in `PersistStorage`
     */
    getDefaultData?: (clientId: string, storageName: StorageName) => Promise<T[]> | T[];
}
/**
 * Interface representing the callbacks for storage events.
 * @template T - Type of the storage data.
 */
interface IStorageCallbacks<T extends IStorageData = IStorageData> {
    /**
     * Callback function for update events.
     * @param items - The updated items.
     * @param clientId - The client ID.
     * @param storageName - The name of the storage.
     */
    onUpdate: (items: T[], clientId: string, storageName: StorageName) => void;
    /**
     * Callback function for search events.
     * @param search - The search query.
     * @param index - The sorted array of storage data.
     * @param clientId - The client ID.
     * @param storageName - The name of the storage.
     */
    onSearch: (search: string, index: SortedArray<T>, clientId: string, storageName: StorageName) => void;
    /**
     * Callback function for init
     * @param clientId - The client ID.
     * @param storageName - The name of the storage.
     */
    onInit: (clientId: string, storageName: StorageName) => void;
    /**
     * Callback function for dispose
     * @param clientId - The client ID.
     * @param storageName - The name of the storage.
     */
    onDispose: (clientId: string, storageName: StorageName) => void;
}
/**
 * Interface representing the parameters for storage.
 * @template T - Type of the storage data.
 */
interface IStorageParams<T extends IStorageData = IStorageData> extends IStorageSchema<T>, Partial<IEmbeddingCallbacks> {
    /**
     * The client ID.
     */
    clientId: string;
    /**
     * Function to calculate similarity.
     */
    calculateSimilarity: IEmbeddingSchema["calculateSimilarity"];
    /**
     * Function to create an embedding.
     */
    createEmbedding: IEmbeddingSchema["createEmbedding"];
    /**
     * The name of the storage.
     */
    storageName: StorageName;
    /**
     * Logger instance.
     */
    logger: ILogger;
    /** The bus instance. */
    bus: IBus;
}
/**
 * Interface representing the storage.
 * @template T - Type of the storage data.
 */
interface IStorage<T extends IStorageData = IStorageData> {
    /**
     * Function to take items from the storage.
     * @param search - The search query.
     * @param total - The total number of items to take.
     * @param score - Optional score parameter.
     * @returns A promise that resolves to an array of storage data.
     */
    take(search: string, total: number, score?: number): Promise<T[]>;
    /**
     * Function to upsert an item in the storage.
     * @param item - The item to upsert.
     * @returns A promise that resolves when the operation is complete.
     */
    upsert(item: T): Promise<void>;
    /**
     * Function to remove an item from the storage.
     * @param itemId - The ID of the item to remove.
     * @returns A promise that resolves when the operation is complete.
     */
    remove(itemId: IStorageData["id"]): Promise<void>;
    /**
     * Function to get an item from the storage.
     * @param itemId - The ID of the item to get.
     * @returns A promise that resolves to the item or null if not found.
     */
    get(itemId: IStorageData["id"]): Promise<T | null>;
    /**
     * Function to list items from the storage.
     * @param filter - Optional filter function.
     * @returns A promise that resolves to an array of storage data.
     */
    list(filter?: (item: T) => boolean): Promise<T[]>;
    /**
     * Function to clear the storage.
     * @returns A promise that resolves when the operation is complete.
     */
    clear(): Promise<void>;
}
/**
 * Type representing the name of the storage.
 */
type StorageName = string;

type IStateData = any;
/**
 * Middleware function for state management.
 * @template T - The type of the state data.
 * @param {T} state - The current state.
 * @param {string} clientId - The client ID.
 * @param {StateName} stateName - The name of the state.
 * @returns {Promise<T>} - The updated state.
 */
interface IStateMiddleware<T extends IStateData = IStateData> {
    (state: T, clientId: string, stateName: StateName): Promise<T>;
}
/**
 * Callbacks for state lifecycle events.
 * @template T - The type of the state data.
 */
interface IStateCallbacks<T extends IStateData = IStateData> {
    /**
     * Called when the state is initialized.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     */
    onInit: (clientId: string, stateName: StateName) => void;
    /**
     * Called when the state is disposed.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     */
    onDispose: (clientId: string, stateName: StateName) => void;
    /**
     * Called when the state is loaded.
     * @param {T} state - The current state.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     */
    onLoad: (state: T, clientId: string, stateName: StateName) => void;
    /**
     * Called when the state is read.
     * @param {T} state - The current state.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     */
    onRead: (state: T, clientId: string, stateName: StateName) => void;
    /**
     * Called when the state is written.
     * @param {T} state - The current state.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     */
    onWrite: (state: T, clientId: string, stateName: StateName) => void;
}
/**
 * Schema for state management.
 * @template T - The type of the state data.
 */
interface IStateSchema<T extends IStateData = IStateData> {
    /** Mark the state to serialize values to the hard drive */
    persist?: boolean;
    /** The description for documentation */
    docDescription?: string;
    /**
     * The agents can share the state
     */
    shared?: boolean;
    /**
     * The name of the state.
     */
    stateName: StateName;
    /**
     * The default value for a state
     */
    getDefaultState: (clientId: string, stateName: StateName) => T | Promise<T>;
    /**
     * Gets the state.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     * @returns {T | Promise<T>} - The current state.
     */
    getState?: (clientId: string, stateName: StateName, defaultState: T) => T | Promise<T>;
    /**
     * Sets the state.
     * @param {T} state - The new state.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     * @returns {Promise<void> | void} - A promise that resolves when the state is set.
     */
    setState?: (state: T, clientId: string, stateName: StateName) => Promise<void> | void;
    /**
     * Middleware functions for state management.
     */
    middlewares?: IStateMiddleware<T>[];
    /**
     * Callbacks for state lifecycle events.
     */
    callbacks?: Partial<IStateCallbacks<T>>;
}
/**
 * Parameters for state management.
 * @template T - The type of the state data.
 */
interface IStateParams<T extends IStateData = IStateData> extends IStateSchema<T> {
    /**
     * The client ID.
     */
    clientId: string;
    /**
     * The logger instance.
     */
    logger: ILogger;
    /** The bus instance. */
    bus: IBus;
}
/**
 * State management interface.
 * @template T - The type of the state data.
 */
interface IState<T extends IStateData = IStateData> {
    /**
     * Gets the state.
     * @returns {Promise<T>} - The current state.
     */
    getState: () => Promise<T>;
    /**
     * Sets the state.
     * @param {(prevState: T) => Promise<T>} dispatchFn - The function to dispatch the new state.
     * @returns {Promise<T>} - The updated state.
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;
    /**
     * Set the state to initial value
     * @returns {Promise<T>} - The initial state.
     */
    clearState: () => Promise<T>;
}
/**
 * The name of the state.
 */
type StateName = string;

/**
 * Interface for policy callbacks.
 */
interface IPolicyCallbacks {
    /**
     * Called when the policy is initialized.
     * @param policyName - The name of the policy.
     */
    onInit?: (policyName: PolicyName) => void;
    /**
     * Called to validate the input.
     * @param incoming - The incoming message.
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     * @param policyName - The name of the policy.
     */
    onValidateInput?: (incoming: string, clientId: SessionId, swarmName: SwarmName, policyName: PolicyName) => void;
    /**
     * Called to validate the output.
     * @param outgoing - The outgoing message.
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     * @param policyName - The name of the policy.
     */
    onValidateOutput?: (outgoing: string, clientId: SessionId, swarmName: SwarmName, policyName: PolicyName) => void;
    /**
     * Called when a client is banned.
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     * @param policyName - The name of the policy.
     */
    onBanClient?: (clientId: SessionId, swarmName: SwarmName, policyName: PolicyName) => void;
    /**
     * Called when a client is unbanned.
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     * @param policyName - The name of the policy.
     */
    onUnbanClient?: (clientId: SessionId, swarmName: SwarmName, policyName: PolicyName) => void;
}
/**
 * Interface for a policy.
 */
interface IPolicy {
    /**
     * Check if got banhammer flag
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     */
    hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Gets the ban message for a client.
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves to the ban message.
     */
    getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;
    /**
     * Validates the input.
     * @param incoming - The incoming message.
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves to a boolean indicating whether the input is valid.
     */
    validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Validates the output.
     * @param outgoing - The outgoing message.
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves to a boolean indicating whether the output is valid.
     */
    validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Bans a client.
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves when the client is banned.
     */
    banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
    /**
     * Unbans a client.
     * @param clientId - The session ID of the client.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves when the client is unbanned.
     */
    unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
}
/**
 * Interface for a policy schema.
 */
interface IPolicySchema {
    /** The description for documentation */
    docDescription?: string;
    /** The name of the policy */
    policyName: PolicyName;
    /** The message to display when a client is banned */
    banMessage?: string;
    /** Ban immediately after failed validation */
    autoBan?: boolean;
    /**
     * Gets the ban message for a client.
     * @param clientId - The session ID of the client.
     * @param policyName - The name of the policy.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves to the ban message or null.
     */
    getBanMessage?: (clientId: SessionId, policyName: PolicyName, swarmName: SwarmName) => Promise<string | null> | string | null;
    /**
     * Gets the list of banned clients.
     * @param policyName - The name of the policy.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves to an array of session IDs.
     */
    getBannedClients: (policyName: PolicyName, swarmName: SwarmName) => SessionId[] | Promise<SessionId[]>;
    /**
     * Sets the list of banned clients.
     * @param clientIds - An array of session IDs.
     * @param policyName - The name of the policy.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves when the clients are banned.
     */
    setBannedClients?: (clientIds: SessionId[], policyName: PolicyName, swarmName: SwarmName) => Promise<void> | void;
    /**
     * Validates the input.
     * @param incoming - The incoming message.
     * @param clientId - The session ID of the client.
     * @param policyName - The name of the policy.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves to a boolean indicating whether the input is valid.
     */
    validateInput?: (incoming: string, clientId: SessionId, policyName: PolicyName, swarmName: SwarmName) => Promise<boolean> | boolean;
    /**
     * Validates the output.
     * @param outgoing - The outgoing message.
     * @param clientId - The session ID of the client.
     * @param policyName - The name of the policy.
     * @param swarmName - The name of the swarm.
     * @returns A promise that resolves to a boolean indicating whether the output is valid.
     */
    validateOutput?: (outgoing: string, clientId: SessionId, policyName: PolicyName, swarmName: SwarmName) => Promise<boolean> | boolean;
    /** The callbacks for the policy */
    callbacks?: IPolicyCallbacks;
}
/**
 * Interface for policy parameters.
 */
interface IPolicyParams extends IPolicySchema, IPolicyCallbacks {
    /** The logger instance. */
    logger: ILogger;
    /** The bus instance. */
    bus: IBus;
}
/** Type alias for policy name */
type PolicyName = string;

/**
 * Interface representing the base context for an event.
 */
interface IBusEventContext {
    /**
     * The name of the agent.
     */
    agentName: AgentName;
    /**
     * The name of the swarm.
     */
    swarmName: SwarmName;
    /**
     * The name of the storage.
     */
    storageName: StorageName;
    /**
     * The name of the state.
     */
    stateName: StateName;
    /**
     * The name of the policy
     */
    policyName: PolicyName;
}
/**
 * Type representing the possible sources of an event.
 */
type EventSource = string;
/**
 * Type representing the possible sources of an event for the internal bus.
 */
type EventBusSource = "agent-bus" | "history-bus" | "session-bus" | "state-bus" | "storage-bus" | "swarm-bus" | "execution-bus" | "policy-bus";
/**
 * Interface representing the base structure of an event.
 */
interface IBaseEvent {
    /**
     * The source of the event.
     */
    source: EventSource;
    /**
     * The client id
     */
    clientId: string;
}
interface IBusEvent extends Omit<IBaseEvent, keyof {
    source: never;
}> {
    /**
     * The source of the event.
     */
    source: EventBusSource;
    /**
     * The type of the event.
     */
    type: string;
    /**
     * The input data for the event.
     */
    input: Record<string, any>;
    /**
     * The output data for the event.
     */
    output: Record<string, any>;
    /**
     * The context of the event.
     */
    context: Partial<IBusEventContext>;
}
interface ICustomEvent<T extends any = any> extends IBaseEvent {
    /**
     * The payload of the event, if any.
     */
    payload?: T;
}

/**
 * Interface representing a Bus.
 */
interface IBus {
    /**
     * Emits an event to a specific client.
     *
     * @template T - The type of event extending IBaseEvent.
     * @param {string} clientId - The ID of the client to emit the event to.
     * @param {T} event - The event to emit.
     * @returns {Promise<void>} A promise that resolves when the event has been emitted.
     */
    emit<T extends IBaseEvent>(clientId: string, event: T): Promise<void>;
}

interface ISwarmSessionCallbacks {
    /**
     * Callback triggered when a client connects.
     * @param clientId - The ID of the client.
     * @param swarmName - The name of the swarm.
     */
    onConnect?: (clientId: string, swarmName: SwarmName) => void;
    /**
     * Callback triggered when a command is executed.
     * @param clientId - The ID of the client.
     * @param swarmName - The name of the swarm.
     * @param content - The content to execute.
     * @param mode - The source of execution: tool or user.
     */
    onExecute?: (clientId: string, swarmName: SwarmName, content: string, mode: ExecutionMode) => void;
    /**
     * Callback triggered when a stateless completion run executed
     * @param clientId - The ID of the client.
     * @param swarmName - The name of the swarm.
     * @param content - The content to execute.
     */
    onRun?: (clientId: string, swarmName: SwarmName, content: string) => void;
    /**
     * Callback triggered when a message is emitted.
     * @param clientId - The ID of the client.
     * @param swarmName - The name of the swarm.
     * @param message - The message to emit.
     */
    onEmit?: (clientId: string, swarmName: SwarmName, message: string) => void;
    /**
     * Callback triggered when a session being connected
     * @param clientId - The ID of the client.
     * @param swarmName - The name of the swarm.
     */
    onInit?: (clientId: string, swarmName: SwarmName) => void;
    /**
     * Callback triggered when a session being disponnected
     * @param clientId - The ID of the client.
     * @param swarmName - The name of the swarm.
     */
    onDispose?: (clientId: string, swarmName: SwarmName) => void;
}
/**
 * Lifecycle callbacks of initialized swarm
 */
interface ISwarmCallbacks extends ISwarmSessionCallbacks {
    /** Emit the callback on agent change */
    onAgentChanged: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void>;
}
/**
 * Parameters for initializing a swarm.
 * @interface
 * @extends {Omit<ISwarmSchema, 'agentList'>}
 */
interface ISwarmParams extends Omit<ISwarmSchema, keyof {
    agentList: never;
    onAgentChanged: never;
}> {
    /** Client identifier */
    clientId: string;
    /** Logger instance */
    logger: ILogger;
    /** The bus instance. */
    bus: IBus;
    /** Map of agent names to agent instances */
    agentMap: Record<AgentName, IAgent>;
}
/**
 * Schema for defining a swarm.
 * @interface
 */
interface ISwarmSchema {
    /** Mark the swarm to serialize it navigation and active agent state to the hard drive */
    persist?: boolean;
    /** The description for documentation */
    docDescription?: string;
    /** The banhammer policies */
    policies?: PolicyName[];
    /** Get the current navigation stack after init */
    getNavigationStack?: (clientId: string, swarmName: SwarmName) => Promise<AgentName[]> | AgentName[];
    /** Upload the current navigation stack after change */
    setNavigationStack?: (clientId: string, navigationStack: AgentName[], swarmName: SwarmName) => Promise<void>;
    /** Fetch the active agent on init */
    getActiveAgent?: (clientId: string, swarmName: SwarmName, defaultAgent: AgentName) => Promise<AgentName> | AgentName;
    /** Update the active agent after navigation */
    setActiveAgent?: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void> | void;
    /** Default agent name */
    defaultAgent: AgentName;
    /** Name of the swarm */
    swarmName: string;
    /** List of agent names */
    agentList: string[];
    /** Lifecycle callbacks*/
    callbacks?: Partial<ISwarmCallbacks>;
}
/**
 * Interface for a swarm.
 * @interface
 */
interface ISwarm {
    /**
     * Pop the navigation stack or return default agent
     * @returns {Promise<string>} - The pending agent for navigation
     */
    navigationPop(): Promise<AgentName>;
    /**
     * Will return empty string in waitForOutput
     * @returns {Promise<void>}
     */
    cancelOutput(): Promise<void>;
    /**
     * Waits for the output from the swarm.
     * @returns {Promise<string>} The output from the swarm.
     */
    waitForOutput(): Promise<string>;
    /**
     * Gets the name of the agent.
     * @returns {Promise<AgentName>} The name of the agent.
     */
    getAgentName(): Promise<AgentName>;
    /**
     * Gets the agent instance.
     * @returns {Promise<IAgent>} The agent instance.
     */
    getAgent(): Promise<IAgent>;
    /**
     * Sets the reference to an agent.
     * @param {AgentName} agentName - The name of the agent.
     * @param {IAgent} agent - The agent instance.
     * @returns {Promise<void>}
     */
    setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
    /**
     * Sets the name of the agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>}
     */
    setAgentName(agentName: AgentName): Promise<void>;
}
/** Type alias for swarm name */
type SwarmName = string;

/**
 * Parameters required to create a session.
 * @interface
 */
interface ISessionParams extends ISessionSchema, ISwarmSessionCallbacks {
    clientId: string;
    logger: ILogger;
    policy: IPolicy;
    bus: IBus;
    swarm: ISwarm;
    swarmName: SwarmName;
}
/**
 * Schema for session data.
 * @interface
 */
interface ISessionSchema {
}
/**
 * Function type for sending messages.
 * @typedef {function} SendMessageFn
 * @param {IOutgoingMessage} outgoing - The outgoing message.
 * @returns {Promise<void> | void}
 */
type SendMessageFn$1<T = void> = (outgoing: IOutgoingMessage) => Promise<T>;
/**
 * Function type for receiving messages.
 * @typedef {function} ReceiveMessageFn
 * @param {IIncomingMessage} incoming - The incoming message.
 * @returns {Promise<void> | void}
 */
type ReceiveMessageFn<T = void> = (incoming: IIncomingMessage) => Promise<T>;
/**
 * Interface for a session.
 * @interface
 */
interface ISession {
    /**
     * Emit a message.
     * @param {string} message - The message to emit.
     * @returns {Promise<void>}
     */
    emit(message: string): Promise<void>;
    /**
     * Run the complete stateless without modifying chat history
     * @param {string} content - The content to execute.
     * @returns {Promise<string>}
     */
    run(content: string): Promise<string>;
    /**
     * Execute a command.
     * @param {string} content - The content to execute.
     * @param {string} mode - The source of execution: tool or user
     * @returns {Promise<string>}
     */
    execute(content: string, mode: ExecutionMode): Promise<string>;
    /**
     * Connect to a message sender.
     * @param {SendMessageFn} connector - The function to send messages.
     * @returns {ReceiveMessageFn}
     */
    connect(connector: SendMessageFn$1, ...args: unknown[]): ReceiveMessageFn<string>;
    /**
     * Commit tool output.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param {string} content - The content to commit.
     * @returns {Promise<void>}
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Commit assistant message without answer
     * @param {string} message - The message to commit.
     * @returns {Promise<void>}
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Commit user message without answer
     * @param {string} message - The message to commit.
     * @returns {Promise<void>}
     */
    commitUserMessage: (message: string) => Promise<void>;
    /**
     * Commit flush of agent history
     * @returns {Promise<void>}
     */
    commitFlush: () => Promise<void>;
    /**
     * Prevent the next tool from being executed
     * @returns {Promise<void>}
     */
    commitStopTools: () => Promise<void>;
    /**
     * Commit a system message.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>}
     */
    commitSystemMessage(message: string): Promise<void>;
}
/**
 * Type for session ID.
 * @typedef {string} SessionId
 */
type SessionId = string;
/**
 * Type for session mode.
 * @typedef {"session" | "makeConnection" | "complete"} SessionMode
 */
type SessionMode = "session" | "makeConnection" | "complete";
/**
 * Tools can emit user messages to trigger user friendly responses.
 * Should be ignored for `getUserHistory`
 * @typedef {"tool" | "user"} ExecutionMode
 */
type ExecutionMode = "tool" | "user";

/**
 * Represents a tool call with a function name and arguments.
 */
interface IToolCall {
    /**
     * The ID of the tool call.
     */
    id: string;
    /**
     * The type of the tool. Currently, only `function` is supported.
     */
    type: 'function';
    /**
     * The function that the model called.
     */
    function: {
        /**
         * The name of the function to be called.
         */
        name: string;
        /**
         * The arguments to be passed to the function.
         */
        arguments: {
            [key: string]: any;
        };
    };
}
/**
 * Represents a tool with a type and function details.
 */
interface ITool {
    /**
     * The type of the tool.
     */
    type: string;
    function: {
        /**
         * The name of the function.
         */
        name: string;
        /**
         * The description of the function.
         */
        description: string;
        /**
         * The parameters required by the function.
         */
        parameters: {
            /**
             * The type of the parameters.
             */
            type: string;
            /**
             * The list of required parameters.
             */
            required: string[];
            /**
             * The properties of the parameters.
             */
            properties: {
                [key: string]: {
                    /**
                     * The type of the property.
                     */
                    type: string;
                    /**
                     * The description of the property.
                     */
                    description: string;
                    /**
                     * The possible values for the property.
                     */
                    enum?: string[];
                };
            };
        };
    };
}

/**
 * Interface representing a model message.
 */
interface IModelMessage {
    /**
     * The role of the message sender.
     * @type {'assistant' | 'system' | 'tool' | 'user' | 'resque' | 'flush'}
     */
    role: "assistant" | "system" | "tool" | "user" | "resque" | "flush";
    /**
     * The name of the agent sending the message.
     * @type {string}
     */
    agentName: string;
    /**
     * The content of the message.
     * @type {string}
     */
    content: string;
    /**
     * The source of message: tool or user
     * @type {ExecutionMode}
     */
    mode: ExecutionMode;
    /**
     * Optional tool calls associated with the message.
     * @type {Array<{ function: { name: string; arguments: { [key: string]: any; }; }; }>}
     */
    tool_calls?: IToolCall[];
    /**
     * Tool call that this message is responding to.
     */
    tool_call_id?: string;
}

/**
 * Identifier for an entity, can be a string or number.
 * @typedef {string | number} EntityId
 */
type EntityId = string | number;
/**
 * Base interface for all persistent entities.
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
 * Interface defining methods for persistent storage operations.
 * @template Entity - The type of entity, defaults to IEntity.
 */
interface IPersistBase<Entity extends IEntity = IEntity> {
    /**
     * Initializes the storage, creating directories and validating existing data.
     * @param {boolean} initial - Whether this is the initial setup (affects caching behavior).
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    waitForInit(initial: boolean): Promise<void>;
    /**
     * Reads an entity from storage by its ID.
     * @param {EntityId} entityId - The ID of the entity to read.
     * @returns {Promise<Entity>} A promise resolving to the entity.
     * @throws {Error} If the entity is not found or reading fails.
     */
    readValue(entityId: EntityId): Promise<Entity>;
    /**
     * Checks if an entity exists in storage.
     * @param {EntityId} entityId - The ID of the entity to check.
     * @returns {Promise<boolean>} A promise resolving to true if the entity exists, false otherwise.
     * @throws {Error} If checking existence fails (other than not found).
     */
    hasValue(entityId: EntityId): Promise<boolean>;
    /**
     * Writes an entity to storage with the specified ID.
     * @param {EntityId} entityId - The ID of the entity to write.
     * @param {Entity} entity - The entity data to write.
     * @returns {Promise<void>} A promise that resolves when writing is complete.
     * @throws {Error} If writing fails.
     */
    writeValue(entityId: EntityId, entity: Entity): Promise<void>;
}
/**
 * Constructor type for creating PersistBase instances.
 * @template EntityName - The type of entity name, defaults to string.
 * @template Entity - The type of entity, defaults to IEntity.
 * @typedef {new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>} TPersistBaseCtor
 */
type TPersistBaseCtor<EntityName extends string = string, Entity extends IEntity = IEntity> = new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>;
/**
 * Base class for persistent storage of entities in the file system.
 * @template EntityName - The type of entity name, defaults to string.
 * @implements {IPersistBase}
 */
declare class PersistBase<EntityName extends string = string> implements IPersistBase {
    readonly entityName: EntityName;
    readonly baseDir: string;
    /** @private The directory path where entity files are stored */
    _directory: string;
    /**
     * Creates a new PersistBase instance for managing persistent storage.
     * @param {EntityName} entityName - The name of the entity type (used as a subdirectory).
     * @param {string} [baseDir=join(process.cwd(), "logs/data")] - The base directory for storing entity files.
     */
    constructor(entityName: EntityName, baseDir?: string);
    /**
     * Computes the file path for an entity based on its ID.
     * @param {EntityId} entityId - The ID of the entity.
     * @returns {string} The full file path for the entity (e.g., `<baseDir>/<entityName>/<entityId>.json`).
     * @private
     */
    _getFilePath(entityId: EntityId): string;
    /**
     * Memoized initialization function to ensure it runs only once.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     * @private
     */
    private [BASE_WAIT_FOR_INIT_SYMBOL];
    /**
     * Initializes the storage directory and validates existing entities.
     * Creates the directory if it doesn't exist and removes invalid files.
     * @param {boolean} initial - Whether this is the initial setup (unused in this implementation).
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    waitForInit(initial: boolean): Promise<void>;
    /**
     * Retrieves the number of entities stored in the directory.
     * @returns {Promise<number>} A promise resolving to the count of `.json` files.
     * @throws {Error} If reading the directory fails.
     */
    getCount(): Promise<number>;
    /**
     * Reads an entity from storage by its ID.
     * @template T - The type of the entity, defaults to IEntity.
     * @param {EntityId} entityId - The ID of the entity to read.
     * @returns {Promise<T>} A promise resolving to the entity data.
     * @throws {Error} If the file is not found (`ENOENT`) or parsing fails.
     */
    readValue<T extends IEntity = IEntity>(entityId: EntityId): Promise<T>;
    /**
     * Checks if an entity exists in storage by its ID.
     * @param {EntityId} entityId - The ID of the entity to check.
     * @returns {Promise<boolean>} A promise resolving to true if the entity exists, false otherwise.
     * @throws {Error} If checking existence fails (other than not found).
     */
    hasValue(entityId: EntityId): Promise<boolean>;
    /**
     * Writes an entity to storage with the specified ID.
     * @template T - The type of the entity, defaults to IEntity.
     * @param {EntityId} entityId - The ID of the entity to write.
     * @param {T} entity - The entity data to write.
     * @returns {Promise<void>} A promise that resolves when writing is complete.
     * @throws {Error} If writing to the file fails.
     */
    writeValue<T extends IEntity = IEntity>(entityId: EntityId, entity: T): Promise<void>;
    /**
     * Removes an entity from storage by its ID.
     * @param {EntityId} entityId - The ID of the entity to remove.
     * @returns {Promise<void>} A promise that resolves when removal is complete.
     * @throws {Error} If the entity is not found or removal fails.
     */
    removeValue(entityId: EntityId): Promise<void>;
    /**
     * Removes all entities from storage.
     * @returns {Promise<void>} A promise that resolves when all entities are removed.
     * @throws {Error} If reading the directory or removing files fails.
     */
    removeAll(): Promise<void>;
    /**
     * Iterates over all entities in storage, sorted numerically by ID.
     * @template T - The type of the entities, defaults to IEntity.
     * @returns {AsyncGenerator<T>} An async generator yielding entities.
     * @throws {Error} If reading the directory or entity files fails.
     */
    values<T extends IEntity = IEntity>(): AsyncGenerator<T>;
    /**
     * Iterates over all entity IDs in storage, sorted numerically.
     * @returns {AsyncGenerator<EntityId>} An async generator yielding entity IDs.
     * @throws {Error} If reading the directory fails.
     */
    keys(): AsyncGenerator<EntityId>;
    /**
     * Implements the async iterator protocol for iterating over entities.
     * @returns {AsyncIterableIterator<any>} An async iterator yielding entities.
     */
    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
    /**
     * Filters entities based on a predicate function.
     * @template T - The type of the entities, defaults to IEntity.
     * @param {(value: T) => boolean} predicate - A function to test each entity.
     * @returns {AsyncGenerator<T>} An async generator yielding entities that pass the predicate.
     */
    filter<T extends IEntity = IEntity>(predicate: (value: T) => boolean): AsyncGenerator<T>;
    /**
     * Takes a limited number of entities, optionally filtered by a predicate.
     * @template T - The type of the entities, defaults to IEntity.
     * @param {number} total - The maximum number of entities to yield.
     * @param {(value: T) => boolean} [predicate] - Optional function to filter entities.
     * @returns {AsyncGenerator<T>} An async generator yielding up to `total` entities.
     */
    take<T extends IEntity = IEntity>(total: number, predicate?: (value: T) => boolean): AsyncGenerator<T>;
}
/**
 * Extends PersistBase to provide a persistent list structure with push/pop operations.
 * @template EntityName - The type of entity name, defaults to string.
 * @extends {PersistBase<EntityName>}
 */
declare class PersistList<EntityName extends string = string> extends PersistBase<EntityName> {
    /** @private Tracks the last used numeric key for the list, null until initialized */
    _lastCount: number | null;
    /**
     * Creates a new PersistList instance for managing a persistent list.
     * @param {EntityName} entityName - The name of the entity type (used as a subdirectory).
     * @param {string} [baseDir] - The base directory for storing list files (defaults to parent class).
     */
    constructor(entityName: EntityName, baseDir?: string);
    /**
     * Queued function to create a new unique key for a list item.
     * Ensures sequential key generation even under concurrent calls.
     * @returns {Promise<string>} A promise resolving to the new key as a string.
     * @private
     */
    private [LIST_CREATE_KEY_SYMBOL];
    /**
     * Retrieves the key of the last item in the list.
     * @returns {Promise<string | null>} A promise resolving to the last key or null if the list is empty.
     * @private
     */
    private [LIST_GET_LAST_KEY_SYMBOL];
    /**
     * Queued function to remove and return the last item in the list.
     * Ensures atomic pop operations under concurrent calls.
     * @template T - The type of the entity, defaults to IEntity.
     * @returns {Promise<T | null>} A promise resolving to the removed item or null if the list is empty.
     * @private
     */
    private [LIST_POP_SYMBOL];
    /**
     * Adds an entity to the end of the persistent list with a new unique key.
     * @template T - The type of the entity, defaults to IEntity.
     * @param {T} entity - The entity to add to the list.
     * @returns {Promise<void>} A promise that resolves when the entity is written.
     * @throws {Error} If writing to the file fails.
     */
    push<T extends IEntity = IEntity>(entity: T): Promise<void>;
    /**
     * Removes and returns the last entity from the persistent list.
     * @template T - The type of the entity, defaults to IEntity.
     * @returns {Promise<T | null>} A promise resolving to the removed entity or null if the list is empty.
     * @throws {Error} If reading or removing the entity fails.
     */
    pop<T extends IEntity = IEntity>(): Promise<T | null>;
}
/**
 * Interface for data stored in active agent persistence.
 */
interface IPersistActiveAgentData {
    /** The name of the active agent */
    agentName: AgentName;
}
/**
 * Interface for data stored in navigation stack persistence.
 */
interface IPersistNavigationStackData {
    /** The stack of agent names representing navigation history */
    agentStack: AgentName[];
}
/**
 * Interface defining control methods for swarm persistence operations.
 */
interface IPersistSwarmControl {
    /**
     * Sets a custom persistence adapter for active agent storage.
     * @param {TPersistBaseCtor<SwarmName, IPersistActiveAgentData>} Ctor - The constructor for active agent persistence.
     */
    usePersistActiveAgentAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>): void;
    /**
     * Sets a custom persistence adapter for navigation stack storage.
     * @param {TPersistBaseCtor<SwarmName, IPersistNavigationStackData>} Ctor - The constructor for navigation stack persistence.
     */
    usePersistNavigationStackAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>): void;
}
/**
 * Utility class for managing swarm-related persistence (active agents and navigation stacks).
 * @implements {IPersistSwarmControl}
 */
declare class PersistSwarmUtils implements IPersistSwarmControl {
    /** @private Default constructor for active agent persistence, defaults to PersistBase */
    private PersistActiveAgentFactory;
    /** @private Default constructor for navigation stack persistence, defaults to PersistBase */
    private PersistNavigationStackFactory;
    /**
     * Memoized function to create or retrieve storage for active agents.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {IPersistBase<IPersistActiveAgentData>} A persistence instance for active agents.
     * @private
     */
    private getActiveAgentStorage;
    /**
     * Sets a custom constructor for active agent persistence.
     * @param {TPersistBaseCtor<SwarmName, IPersistActiveAgentData>} Ctor - The constructor to use.
     */
    usePersistActiveAgentAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>): void;
    /**
     * Sets a custom constructor for navigation stack persistence.
     * @param {TPersistBaseCtor<SwarmName, IPersistNavigationStackData>} Ctor - The constructor to use.
     */
    usePersistNavigationStackAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>): void;
    /**
     * Memoized function to create or retrieve storage for navigation stacks.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {IPersistBase<IPersistNavigationStackData>} A persistence instance for navigation stacks.
     * @private
     */
    private getNavigationStackStorage;
    /**
     * Retrieves the active agent for a client in a swarm.
     * @param {string} clientId - The client identifier.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {AgentName} defaultAgent - The default agent name to return if none is set.
     * @returns {Promise<AgentName>} A promise resolving to the active agent name.
     * @throws {Error} If reading from storage fails.
     */
    getActiveAgent: (clientId: string, swarmName: SwarmName, defaultAgent: AgentName) => Promise<AgentName>;
    /**
     * Sets the active agent for a client in a swarm.
     * @param {string} clientId - The client identifier.
     * @param {AgentName} agentName - The name of the agent to set as active.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {Promise<void>} A promise that resolves when the active agent is written.
     * @throws {Error} If writing to storage fails.
     */
    setActiveAgent: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void>;
    /**
     * Retrieves the navigation stack for a client in a swarm.
     * @param {string} clientId - The client identifier.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {Promise<AgentName[]>} A promise resolving to the navigation stack (array of agent names).
     * @throws {Error} If reading from storage fails.
     */
    getNavigationStack: (clientId: string, swarmName: SwarmName) => Promise<AgentName[]>;
    /**
     * Sets the navigation stack for a client in a swarm.
     * @param {string} clientId - The client identifier.
     * @param {AgentName[]} agentStack - The navigation stack (array of agent names) to set.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {Promise<void>} A promise that resolves when the navigation stack is written.
     * @throws {Error} If writing to storage fails.
     */
    setNavigationStack: (clientId: string, agentStack: AgentName[], swarmName: SwarmName) => Promise<void>;
}
/**
 * Exported singleton for swarm persistence operations, cast as the control interface.
 * @type {IPersistSwarmControl}
 */
declare const PersistSwarm: IPersistSwarmControl;
/**
 * Interface for state data persistence.
 * @template T - The type of the state data, defaults to unknown.
 */
interface IPersistStateData<T = unknown> {
    /** The state data to persist */
    state: T;
}
/**
 * Interface defining control methods for state persistence operations.
 */
interface IPersistStateControl {
    /**
     * Sets a custom persistence adapter for state storage.
     * @param {TPersistBaseCtor<StorageName, IPersistStateData>} Ctor - The constructor for state persistence.
     */
    usePersistStateAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStateData>): void;
}
/**
 * Utility class for managing state persistence.
 * @implements {IPersistStateControl}
 */
declare class PersistStateUtils implements IPersistStateControl {
    /** @private Default constructor for state persistence, defaults to PersistBase */
    private PersistStateFactory;
    /**
     * Memoized function to create or retrieve storage for a specific state.
     * @param {StateName} stateName - The name of the state.
     * @returns {IPersistBase<IPersistStateData>} A persistence instance for the state.
     * @private
     */
    private getStateStorage;
    /**
     * Sets a custom constructor for state persistence.
     * @param {TPersistBaseCtor<StorageName, IPersistStateData>} Ctor - The constructor to use.
     */
    usePersistStateAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStateData>): void;
    /**
     * Sets the state for a client under a specific state name.
     * @template T - The type of the state data, defaults to unknown.
     * @param {T} state - The state data to persist.
     * @param {string} clientId - The client identifier.
     * @param {StateName} stateName - The name of the state.
     * @returns {Promise<void>} A promise that resolves when the state is written.
     * @throws {Error} If writing to storage fails.
     */
    setState: <T = unknown>(state: T, clientId: string, stateName: StateName) => Promise<void>;
    /**
     * Retrieves the state for a client under a specific state name.
     * @template T - The type of the state data, defaults to unknown.
     * @param {string} clientId - The client identifier.
     * @param {StateName} stateName - The name of the state.
     * @param {T} defaultState - The default state to return if none is set.
     * @returns {Promise<T>} A promise resolving to the state data.
     * @throws {Error} If reading from storage fails.
     */
    getState: <T = unknown>(clientId: string, stateName: StateName, defaultState: T) => Promise<T>;
}
/**
 * Exported singleton for state persistence operations, cast as the control interface.
 * @type {IPersistStateControl}
 */
declare const PersistState: IPersistStateControl;
/**
 * Interface for storage data persistence.
 * @template T - The type of storage data, defaults to IStorageData.
 */
interface IPersistStorageData<T extends IStorageData = IStorageData> {
    /** The array of storage data to persist */
    data: T[];
}
/**
 * Interface defining control methods for storage persistence operations.
 */
interface IPersistStorageControl {
    /**
     * Sets a custom persistence adapter for storage.
     * @param {TPersistBaseCtor<StorageName, IPersistStorageData>} Ctor - The constructor for storage persistence.
     */
    usePersistStorageAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>): void;
}
/**
 * Utility class for managing storage persistence.
 * @implements {IPersistStorageControl}
 */
declare class PersistStorageUtils implements IPersistStorageControl {
    /** @private Default constructor for storage persistence, defaults to PersistBase */
    private PersistStorageFactory;
    /**
     * Memoized function to create or retrieve storage for a specific storage name.
     * @param {StorageName} storageName - The name of the storage.
     * @returns {IPersistBase<IPersistStorageData>} A persistence instance for the storage.
     * @private
     */
    private getPersistStorage;
    /**
     * Sets a custom constructor for storage persistence.
     * @param {TPersistBaseCtor<StorageName, IPersistStorageData>} Ctor - The constructor to use.
     */
    usePersistStorageAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>): void;
    /**
     * Retrieves the data for a client from a specific storage.
     * @template T - The type of the storage data, defaults to IStorageData.
     * @param {string} clientId - The client identifier.
     * @param {StorageName} storageName - The name of the storage.
     * @param {T[]} defaultValue - The default value to return if no data is set.
     * @returns {Promise<T[]>} A promise resolving to the storage data array.
     * @throws {Error} If reading from storage fails.
     */
    getData: <T extends IStorageData = IStorageData>(clientId: string, storageName: StorageName, defaultValue: T[]) => Promise<T[]>;
    /**
     * Sets the data for a client in a specific storage.
     * @template T - The type of the storage data, defaults to IStorageData.
     * @param {T[]} data - The array of data to persist.
     * @param {string} clientId - The client identifier.
     * @param {StorageName} storageName - The name of the storage.
     * @returns {Promise<void>} A promise that resolves when the data is written.
     * @throws {Error} If writing to storage fails.
     */
    setData: <T extends IStorageData = IStorageData>(data: T[], clientId: string, storageName: StorageName) => Promise<void>;
}
/**
 * Exported singleton for storage persistence operations, cast as the control interface.
 * @type {IPersistStorageControl}
 */
declare const PersistStorage: IPersistStorageControl;

/**
 * Callbacks for managing history instance lifecycle and message handling.
 */
interface IHistoryInstanceCallbacks {
    /**
     * Retrieves dynamic system prompt messages for an agent.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<string[]> | string[]} An array of system prompt message contents.
     */
    getSystemPrompt?: (clientId: string, agentName: AgentName) => Promise<string[]> | string[];
    /**
     * Determines whether a message should be included in the history iteration.
     * @param {IModelMessage} message - The message to evaluate.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<boolean> | boolean} Whether the message passes the filter.
     */
    filterCondition?: (message: IModelMessage, clientId: string, agentName: AgentName) => Promise<boolean> | boolean;
    /**
     * Fetches initial history data for an agent.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<IModelMessage[]> | IModelMessage[]} The initial array of history messages.
     */
    getData: (clientId: string, agentName: AgentName) => Promise<IModelMessage[]> | IModelMessage[];
    /**
     * Called when the history array changes (e.g., after push or pop).
     * @param {IModelMessage[]} data - The updated array of history messages.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     */
    onChange: (data: IModelMessage[], clientId: string, agentName: AgentName) => void;
    /**
     * Called when a new message is pushed to the history.
     * @param {IModelMessage} data - The newly pushed message.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     */
    onPush: (data: IModelMessage, clientId: string, agentName: AgentName) => void;
    /**
     * Called when the last message is popped from the history.
     * @param {IModelMessage | null} data - The popped message, or null if the history is empty.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     */
    onPop: (data: IModelMessage | null, clientId: string, agentName: AgentName) => void;
    /**
     * Called for each message during iteration when reading.
     * @param {IModelMessage} message - The current message being read.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     */
    onRead: (message: IModelMessage, clientId: string, agentName: AgentName) => void;
    /**
     * Called at the start of a history read operation.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     */
    onReadBegin: (clientId: string, agentName: AgentName) => void;
    /**
     * Called at the end of a history read operation.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     */
    onReadEnd: (clientId: string, agentName: AgentName) => void;
    /**
     * Called when the history instance is disposed.
     * @param {string} clientId - The client ID.
     */
    onDispose: (clientId: string) => void;
    /**
     * Called when the history instance is initialized.
     * @param {string} clientId - The client ID.
     */
    onInit: (clientId: string) => void;
    /**
     * Provides a reference to the history instance after creation.
     * @param {IHistoryInstance} history - The history instance.
     */
    onRef: (history: IHistoryInstance) => void;
}
/**
 * Interface defining methods for interacting with a history adapter.
 */
interface IHistoryAdapter {
    /**
     * Iterates over history messages for a client and agent.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {AsyncIterableIterator<IModelMessage>} An async iterator yielding history messages.
     */
    iterate(clientId: string, agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Adds a new message to the history.
     * @param {IModelMessage} value - The message to add.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>} A promise that resolves when the message is added.
     */
    push: (value: IModelMessage, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Removes and returns the last message from the history.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<IModelMessage | null>} The last message, or null if the history is empty.
     */
    pop: (clientId: string, agentName: AgentName) => Promise<IModelMessage | null>;
    /**
     * Disposes of the history for a client and agent, optionally clearing all data.
     * @param {string} clientId - The client ID.
     * @param {AgentName | null} agentName - The name of the agent, or null to dispose fully.
     * @returns {Promise<void>} A promise that resolves when disposal is complete.
     */
    dispose: (clientId: string, agentName: AgentName | null) => Promise<void>;
}
/**
 * Interface defining control methods for configuring history behavior.
 */
interface IHistoryControl {
    /**
     * Sets a custom history instance constructor for the adapter.
     * @param {THistoryInstanceCtor} Ctor - The constructor for creating history instances.
     */
    useHistoryAdapter(Ctor: THistoryInstanceCtor): void;
    /**
     * Configures lifecycle callbacks for history instances.
     * @param {Partial<IHistoryInstanceCallbacks>} Callbacks - The callbacks to apply.
     */
    useHistoryCallbacks: (Callbacks: Partial<IHistoryInstanceCallbacks>) => void;
}
/**
 * Interface defining methods for a history instance implementation.
 */
interface IHistoryInstance {
    /**
     * Iterates over history messages for an agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {AsyncIterableIterator<IModelMessage>} An async iterator yielding history messages.
     */
    iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Initializes the history for an agent, loading initial data if needed.
     * @param {AgentName} agentName - The name of the agent.
     * @param {boolean} init - Whether this is the initial setup (affects caching behavior).
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    waitForInit(agentName: AgentName, init: boolean): Promise<void>;
    /**
     * Adds a new message to the history for an agent.
     * @param {IModelMessage} value - The message to add.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>} A promise that resolves when the message is added.
     */
    push(value: IModelMessage, agentName: AgentName): Promise<void>;
    /**
     * Removes and returns the last message from the history for an agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<IModelMessage | null>} The last message, or null if the history is empty.
     */
    pop(agentName: AgentName): Promise<IModelMessage | null>;
    /**
     * Disposes of the history for an agent, optionally clearing all data.
     * @param {AgentName | null} agentName - The name of the agent, or null to dispose fully.
     * @returns {Promise<void>} A promise that resolves when disposal is complete.
     */
    dispose(agentName: AgentName | null): Promise<void>;
}
/**
 * Constructor type for creating history instances.
 * @typedef {new (clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>) => IHistoryInstance} THistoryInstanceCtor
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
declare class HistoryPersistInstance implements IHistoryInstance {
    readonly clientId: string;
    readonly callbacks: Partial<IHistoryInstanceCallbacks>;
    /** @private The in-memory array of history messages */
    _array: IModelMessage[];
    /** @private The persistent storage instance for history messages */
    _persistStorage: PersistList;
    /**
     * Memoized initialization function to ensure it runs only once per agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     * @private
     */
    private [HISTORY_PERSIST_INSTANCE_WAIT_FOR_INIT];
    /**
     * Initializes the history for an agent, loading data from persistent storage if needed.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    waitForInit(agentName: AgentName): Promise<void>;
    /**
     * Creates a new persistent history instance.
     * Invokes onInit and onRef callbacks if provided.
     * @param {string} clientId - The client ID.
     * @param {Partial<IHistoryInstanceCallbacks>} callbacks - The lifecycle callbacks.
     */
    constructor(clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>);
    /**
     * Iterates over history messages, applying filters and system prompts if configured.
     * Invokes onRead callbacks during iteration if provided.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {AsyncIterableIterator<IModelMessage>} An async iterator yielding filtered messages.
     */
    iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Adds a new message to the history, persisting it to storage.
     * Invokes onPush and onChange callbacks if provided.
     * @param {IModelMessage} value - The message to add.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>} A promise that resolves when the message is persisted.
     */
    push(value: IModelMessage, agentName: AgentName): Promise<void>;
    /**
     * Removes and returns the last message from the history, updating persistent storage.
     * Invokes onPop and onChange callbacks if provided.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<IModelMessage | null>} The last message, or null if the history is empty.
     */
    pop(agentName: AgentName): Promise<IModelMessage | null>;
    /**
     * Disposes of the history, clearing all data if agentName is null.
     * Invokes onDispose callback if provided.
     * @param {AgentName | null} agentName - The name of the agent, or null to clear all data.
     * @returns {Promise<void>} A promise that resolves when disposal is complete.
     */
    dispose(agentName: AgentName | null): Promise<void>;
}
/**
 * Manages an in-memory history of messages without persistence.
 * @implements {IHistoryInstance}
 */
declare class HistoryMemoryInstance implements IHistoryInstance {
    readonly clientId: string;
    readonly callbacks: Partial<IHistoryInstanceCallbacks>;
    /** @private The in-memory array of history messages */
    _array: IModelMessage[];
    /**
     * Memoized initialization function to ensure it runs only once per agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     * @private
     */
    private [HISTORY_MEMORY_INSTANCE_WAIT_FOR_INIT];
    /**
     * Initializes the history for an agent, loading initial data if needed.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    waitForInit(agentName: AgentName): Promise<void>;
    /**
     * Creates a new in-memory history instance.
     * Invokes onInit and onRef callbacks if provided.
     * @param {string} clientId - The client ID.
     * @param {Partial<IHistoryInstanceCallbacks>} callbacks - The lifecycle callbacks.
     */
    constructor(clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>);
    /**
     * Iterates over history messages, applying filters and system prompts if configured.
     * Invokes onRead callbacks during iteration if provided.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {AsyncIterableIterator<IModelMessage>} An async iterator yielding filtered messages.
     */
    iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Adds a new message to the in-memory history.
     * Invokes onPush and onChange callbacks if provided.
     * @param {IModelMessage} value - The message to add.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>} A promise that resolves when the message is added.
     */
    push(value: IModelMessage, agentName: AgentName): Promise<void>;
    /**
     * Removes and returns the last message from the in-memory history.
     * Invokes onPop and onChange callbacks if provided.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<IModelMessage | null>} The last message, or null if the history is empty.
     */
    pop(agentName: AgentName): Promise<IModelMessage | null>;
    /**
     * Disposes of the history, clearing all data if agentName is null.
     * Invokes onDispose callback if provided.
     * @param {AgentName | null} agentName - The name of the agent, or null to clear all data.
     * @returns {Promise<void>} A promise that resolves when disposal is complete.
     */
    dispose(agentName: AgentName | null): Promise<void>;
}
/**
 * Exported History Control interface for configuring history behavior.
 * @type {IHistoryControl}
 */
declare const History: IHistoryControl;

/**
 * Interface representing the history of model messages.
 */
interface IHistory {
    /**
     * Pushes a message to the history.
     * @param {IModelMessage} message - The message to push.
     * @returns {Promise<void>}
     */
    push(message: IModelMessage): Promise<void>;
    /**
     * Pop the last message from a history
     * @returns {Promise<IModelMessage | null>}
     */
    pop(): Promise<IModelMessage | null>;
    /**
     * Converts the history to an array of messages for a specific agent.
     * @param {string} prompt - The prompt to filter messages for the agent.
     * @returns {Promise<IModelMessage[]>}
     */
    toArrayForAgent(prompt: string, system?: string[]): Promise<IModelMessage[]>;
    /**
     * Converts the history to an array of raw messages.
     * @returns {Promise<IModelMessage[]>}
     */
    toArrayForRaw(): Promise<IModelMessage[]>;
}
/**
 * Interface representing the parameters required to create a history instance.
 */
interface IHistoryParams extends IHistorySchema {
    /**
     * The name of the agent.
     * @type {AgentName}
     */
    agentName: AgentName;
    /**
     * The client ID.
     * @type {string}
     */
    clientId: string;
    /**
     * The logger instance.
     * @type {ILogger}
     */
    logger: ILogger;
    /** The bus instance. */
    bus: IBus;
}
/**
 * Interface representing the schema of the history.
 */
interface IHistorySchema {
    /**
     * The adapter for array of model messages.
     * @type {IHistoryAdapter}
     */
    items: IHistoryAdapter;
}

/**
 * Interface representing a completion.
 */
interface ICompletion extends ICompletionSchema {
}
/**
 * Arguments required to get a completion.
 */
interface ICompletionArgs {
    /**
     * Client ID.
     */
    clientId: string;
    /**
     * Name of the agent.
     */
    agentName: AgentName;
    /**
     * The source of the last message: tool or user
     */
    mode: ExecutionMode;
    /**
     * Array of model messages.
     */
    messages: IModelMessage[];
    /**
     * Optional array of tools.
     */
    tools?: ITool[];
}
/**
 * Completion lifecycle callbacks
 */
interface ICompletionCallbacks {
    /**
     * Callback fired after complete.
     * @param args - Arguments passed to complete
     * @param output - Output of the model
     */
    onComplete?: (args: ICompletionArgs, output: IModelMessage) => void;
}
/**
 * Schema for a completion.
 */
interface ICompletionSchema {
    /**
     * Name of the completion.
     */
    completionName: CompletionName;
    /**
     * Method to get a completion.
     * @param args - Arguments required to get a completion.
     * @returns A promise that resolves to a model message.
     */
    getCompletion(args: ICompletionArgs): Promise<IModelMessage>;
    /**
     * Completion lifecycle callbacks
     */
    callbacks?: Partial<ICompletionCallbacks>;
}
/**
 * Type representing the name of a completion.
 */
type CompletionName = string;

type ToolValue = string | number | boolean | null;
/**
 * Interface representing lifecycle callbacks of a tool
 * @template T - The type of the parameters for the tool.
 */
interface IAgentToolCallbacks<T = Record<string, ToolValue>> {
    /**
     * Callback triggered before the tool is called.
     * @param toolId - The `tool_call_id` for openai history
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param params - The parameters for the tool.
     * @returns A promise that resolves when the tool call is complete.
     */
    onBeforeCall?: (toolId: string, clientId: string, agentName: AgentName, params: T) => Promise<void>;
    /**
     * Callback triggered after the tool is called.
     * @param toolId - The `tool_call_id` for openai history
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param params - The parameters for the tool.
     * @returns A promise that resolves when the tool call is complete.
     */
    onAfterCall?: (toolId: string, clientId: string, agentName: AgentName, params: T) => Promise<void>;
    /**
     * Callback triggered when the tool parameters are validated.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param params - The parameters for the tool.
     * @returns A promise that resolves to a boolean indicating whether the parameters are valid.
     */
    onValidate?: (clientId: string, agentName: AgentName, params: T) => Promise<boolean>;
    /**
     * Callback triggered when the tool fails to execute
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param params - The parameters for the tool.
     * @returns A promise that resolves to a boolean indicating whether the parameters are valid.
     */
    onCallError?: (toolId: string, clientId: string, agentName: AgentName, params: T, error: Error) => Promise<void>;
}
/**
 * Interface representing a tool used by an agent.
 * @template T - The type of the parameters for the tool.
 */
interface IAgentTool<T = Record<string, ToolValue>> extends ITool {
    /** The description for documentation */
    docNote?: string;
    /** The name of the tool. */
    toolName: ToolName;
    /**
     * Calls the tool with the specified parameters.
     * @param toolId - The `tool_call_id` for openai history
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param params - The parameters for the tool.
     * @returns A promise that resolves when the tool call is complete.
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
     * Validates the parameters for the tool.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param params - The parameters for the tool.
     * @returns A promise that resolves to a boolean indicating whether the parameters are valid, or a boolean.
     */
    validate(dto: {
        clientId: string;
        agentName: AgentName;
        toolCalls: IToolCall[];
        params: T;
    }): Promise<boolean> | boolean;
    /** The name of the tool. */
    callbacks?: Partial<IAgentToolCallbacks>;
}
/**
 * Interface representing the parameters for an agent.
 */
interface IAgentParams extends Omit<IAgentSchema, keyof {
    tools: never;
    completion: never;
    validate: never;
}>, IAgentSchemaCallbacks {
    /** The ID of the client. */
    clientId: string;
    /** The logger instance. */
    logger: ILogger;
    /** The bus instance. */
    bus: IBus;
    /** The history instance. */
    history: IHistory;
    /** The completion instance. */
    completion: ICompletion;
    /** The tools used by the agent. */
    tools?: IAgentTool[];
    /**
     * Validates the output.
     * @param output - The output to validate.
     * @returns A promise that resolves to a string or null.
     */
    validate: (output: string) => Promise<string | null>;
}
/**
 * Interface representing the lifecycle callbacks of an agent
 */
interface IAgentSchemaCallbacks {
    /**
     * Callback triggered when the agent run stateless.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param input - The input to execute.
     * @param mode - The source of execution: tool or user.
     */
    onRun?: (clientId: string, agentName: AgentName, input: string) => void;
    /**
     * Callback triggered when the agent executes.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param input - The input to execute.
     * @param mode - The source of execution: tool or user.
     */
    onExecute?: (clientId: string, agentName: AgentName, input: string, mode: ExecutionMode) => void;
    /**
     * Callback triggered when there is tool output.
     * @param toolId - The `tool_call_id` for openai history
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param content - The content of the tool output.
     */
    onToolOutput?: (toolId: string, clientId: string, agentName: AgentName, content: string) => void;
    /**
     * Callback triggered when there is a system message.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param message - The system message.
     */
    onSystemMessage?: (clientId: string, agentName: AgentName, message: string) => void;
    /**
     * Callback triggered when there is a committed assistant message.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param message - The system message.
     */
    onAssistantMessage?: (clientId: string, agentName: AgentName, message: string) => void;
    /**
     * Callback triggered when there is a user message.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param message - The user message.
     */
    onUserMessage?: (clientId: string, agentName: AgentName, message: string) => void;
    /**
     * Callback triggered when the agent history is flushed.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     */
    onFlush?: (clientId: string, agentName: AgentName) => void;
    /**
     * Callback triggered when there is output.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param output - The output string.
     */
    onOutput?: (clientId: string, agentName: AgentName, output: string) => void;
    /**
     * Callback triggered when the agent is resurrected.
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param mode - The source of execution: tool or user.
     * @param reason - The reason for the resurrection.
     */
    onResurrect?: (clientId: string, agentName: AgentName, mode: ExecutionMode, reason?: string) => void;
    /**
     * Callback triggered when agent is initialized
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     */
    onInit?: (clientId: string, agentName: AgentName) => void;
    /**
     * Callback triggered when agent is disposed
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     */
    onDispose?: (clientId: string, agentName: AgentName) => void;
    /**
     * Callback triggered after all tools are called
     * @param clientId - The ID of the client.
     * @param agentName - The name of the agent.
     * @param toolCalls - The array of tool calls
     */
    onAfterToolCalls?: (clientId: string, agentName: AgentName, toolCalls: IToolCall[]) => void;
}
/**
 * Interface representing the schema for an agent.
 */
interface IAgentSchema {
    /** The map function to filter unwanted tool calls */
    mapToolCalls?: (tool: IToolCall[], clientId: string, agentName: AgentName) => IToolCall[] | Promise<IToolCall[]>;
    /** The maximum quantity of tool calls per complete */
    maxToolCalls?: number;
    /** The description for documentation */
    docDescription?: string;
    /** The name of the agent. */
    agentName: AgentName;
    /** The name of the completion. */
    completion: CompletionName;
    /** The prompt for the agent. */
    prompt: string;
    /** The system prompt. Usually used for tool calling protocol. */
    system?: string[];
    /** The names of the tools used by the agent. */
    tools?: ToolName[];
    /** The names of the storages used by the agent. */
    storages?: StorageName[];
    /** The names of the states used by the agent. */
    states?: StateName[];
    /** The list of dependencies for changeToAgent */
    dependsOn?: AgentName[];
    /**
     * Validates the output.
     * @param output - The output to validate.
     * @returns A promise that resolves to a string or null.
     */
    validate?: (output: string) => Promise<string | null>;
    /** The transform function for model output */
    transform?: (input: string, clientId: string, agentName: AgentName) => Promise<string> | string;
    /** The map function for assistant messages. Use to transform json to tool_call for deepseek r1 on ollama*/
    map?: (message: IModelMessage, clientId: string, agentName: AgentName) => Promise<IModelMessage> | IModelMessage;
    /** The lifecycle calbacks of the agent. */
    callbacks?: Partial<IAgentSchemaCallbacks>;
}
/**
 * Interface representing an agent.
 */
interface IAgent {
    /**
     * Run the complete stateless without write to the chat history
     * @param input - The input to run.
     * @returns A promise that resolves when the run is complete.
     */
    run: (input: string) => Promise<string>;
    /**
     * Executes the agent with the given input.
     * @param input - The input to execute.
     * @param mode - The source of execution: tool or user.
     * @returns A promise that resolves when the execution is complete.
     */
    execute: (input: string, mode: ExecutionMode) => Promise<void>;
    /**
     * Waits for the output from the agent.
     * @returns A promise that resolves to the output string.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Commits the tool output.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param content - The content of the tool output.
     * @returns A promise that resolves when the tool output is committed.
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Commits a system message.
     * @param message - The system message to commit.
     * @returns A promise that resolves when the system message is committed.
     */
    commitSystemMessage(message: string): Promise<void>;
    /**
     * Commits a user message without answer.
     * @param message - The message to commit.
     * @returns A promise that resolves when the message is committed.
     */
    commitUserMessage(message: string): Promise<void>;
    /**
     * Commits an assistant message without answer.
     * @param message - The message to commit.
     * @returns A promise that resolves when the message is committed.
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Clears the history for the agent.
     * @returns A promise that resolves when the flush is committed.
     */
    commitFlush(): Promise<void>;
    /**
     * Prevent the next tool from being executed
     * @returns A promise that resolves when the tool stop is committed.
     */
    commitStopTools(): Promise<void>;
    /**
     * Unlock the queue on agent change. Stop the next tool execution
     * @returns A promise that resolves when the agent change is committed.
     */
    commitAgentChange(): Promise<void>;
    /**
     * Prevent the next tool from execution
     * @returns A promise that resolves when the tool stop is committed.
     */
    commitStopTools(): Promise<void>;
}
/** Type representing the name of an agent. */
type AgentName = string;
/** Type representing the name of a tool. */
type ToolName = string;

/**
 * Interface representing the context.
 */
interface IMethodContext {
    clientId: string;
    methodName: string;
    agentName: AgentName;
    swarmName: SwarmName;
    storageName: StorageName;
    stateName: StateName;
    policyName: PolicyName;
}
/**
 * Service providing method call context information.
 */
declare const MethodContextService: (new () => {
    readonly context: IMethodContext;
}) & Omit<{
    new (context: IMethodContext): {
        readonly context: IMethodContext;
    };
}, "prototype"> & di_scoped.IScopedClassRun<[context: IMethodContext]>;

/**
 * LoggerService class that implements the ILogger interface.
 * Provides methods to log and debug messages.
 */
declare class LoggerService implements ILogger {
    private readonly methodContextService;
    private readonly executionContextService;
    private _commonLogger;
    /**
     * Creates the client logs adapter using factory
     */
    private getLoggerAdapter;
    /**
     * Logs messages using the current logger.
     * @param {...any} args - The messages to log.
     */
    log: (topic: string, ...args: any[]) => void;
    /**
     * Logs debug messages using the current logger.
     * @param {...any} args - The debug messages to log.
     */
    debug: (topic: string, ...args: any[]) => void;
    /**
     * Logs info messages using the current logger.
     * @param {...any} args - The info messages to log.
     */
    info: (topic: string, ...args: any[]) => void;
    /**
     * Sets a new logger.
     * @param {ILogger} logger - The new logger to set.
     */
    setLogger: (logger: ILogger) => void;
}

declare const AGENT_CHANGE_SYMBOL: unique symbol;
declare const MODEL_RESQUE_SYMBOL: unique symbol;
declare const TOOL_ERROR_SYMBOL: unique symbol;
declare const TOOL_STOP_SYMBOL: unique symbol;
/**
 * Represents a client agent that interacts with the system, managing message execution, tool calls, and history.
 * @implements {IAgent}
 */
declare class ClientAgent implements IAgent {
    readonly params: IAgentParams;
    readonly _agentChangeSubject: Subject<typeof AGENT_CHANGE_SYMBOL>;
    readonly _resqueSubject: Subject<typeof MODEL_RESQUE_SYMBOL>;
    readonly _toolErrorSubject: Subject<typeof TOOL_ERROR_SYMBOL>;
    readonly _toolStopSubject: Subject<typeof TOOL_STOP_SYMBOL>;
    readonly _toolCommitSubject: Subject<void>;
    readonly _outputSubject: Subject<string>;
    /**
     * Creates an instance of ClientAgent.
     * @param {IAgentParams} params - The parameters for initializing the agent.
     */
    constructor(params: IAgentParams);
    /**
     * Emits the transformed output after validation, invoking callbacks and emitting events.
     * If validation fails, attempts to resurrect the model and revalidate.
     * @param {ExecutionMode} mode - The execution mode (e.g., user or tool).
     * @param {string} rawResult - The raw result to be transformed and emitted.
     * @returns {Promise<void>}
     * @throws {Error} If validation fails after model resurrection.
     * @private
     */
    _emitOutput(mode: ExecutionMode, rawResult: string): Promise<void>;
    /**
     * Resurrects the model in case of failures by applying configured strategies (e.g., flush, recomplete, custom).
     * Updates the history and returns a placeholder or transformed result.
     * @param {ExecutionMode} mode - The execution mode (e.g., user or tool).
     * @param {string} [reason="unknown"] - The reason for resurrecting the model.
     * @returns {Promise<string>} A placeholder or transformed result after resurrection.
     * @private
     */
    _resurrectModel(mode: ExecutionMode, reason?: string): Promise<string>;
    /**
     * Waits for the output to be available and returns it.
     * @returns {Promise<string>} The output emitted by the agent.
     */
    waitForOutput(): Promise<string>;
    /**
     * Retrieves a completion message from the model based on the current history and tools.
     * Handles validation and applies resurrection strategies if needed.
     * @param {ExecutionMode} mode - The execution mode (e.g., user or tool).
     * @returns {Promise<IModelMessage>} The completion message from the model.
     */
    getCompletion(mode: ExecutionMode): Promise<IModelMessage>;
    /**
     * Commits a user message to the history without triggering a response.
     * @param {string} message - The user message to commit.
     * @returns {Promise<void>}
     */
    commitUserMessage(message: string): Promise<void>;
    /**
     * Commits a flush of the agent's history, clearing it and notifying the system.
     * @returns {Promise<void>}
     */
    commitFlush(): Promise<void>;
    /**
     * Signals a change in the agent to halt subsequent tool executions.
     * Emits an event to notify the system.
     * @returns {Promise<void>}
     */
    commitAgentChange(): Promise<void>;
    /**
     * Signals a stop to prevent further tool executions.
     * Emits an event to notify the system.
     * @returns {Promise<void>}
     */
    commitStopTools(): Promise<void>;
    /**
     * Commits a system message to the history and notifies the system.
     * @param {string} message - The system message to commit.
     * @returns {Promise<void>}
     */
    commitSystemMessage(message: string): Promise<void>;
    /**
     * Commits an assistant message to the history without triggering execution.
     * @param {string} message - The assistant message to commit.
     * @returns {Promise<void>}
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Commits the tool output to the history and notifies the system.
     * @param {string} toolId - The ID of the tool that produced the output.
     * @param {string} content - The tool output content.
     * @returns {Promise<void>}
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Executes the incoming message and processes tool calls if any.
     * Queues the execution to prevent overlapping calls.
     * @param {string} incoming - The incoming message content.
     * @param {ExecutionMode} mode - The execution mode (e.g., user or tool).
     * @returns {Promise<void>}
     */
    execute: IAgent["execute"];
    /**
     * Runs the completion statelessly and returns the transformed output.
     * Queues the execution to prevent overlapping calls.
     * @param {string} incoming - The incoming message content.
     * @returns {Promise<string>} The transformed result of the completion.
     */
    run: IAgent["run"];
    /**
     * Disposes of the agent, performing cleanup and invoking the onDispose callback.
     * @returns {Promise<void>}
     */
    dispose(): Promise<void>;
}

/**
 * Service for managing agent connections.
 * @implements {IAgent}
 */
declare class AgentConnectionService implements IAgent {
    private readonly loggerService;
    private readonly busService;
    private readonly methodContextService;
    private readonly sessionValidationService;
    private readonly historyConnectionService;
    private readonly storageConnectionService;
    private readonly stateConnectionService;
    private readonly agentSchemaService;
    private readonly toolSchemaService;
    private readonly completionSchemaService;
    /**
     * Retrieves an agent instance.
     * @param {string} clientId - The client ID.
     * @param {string} agentName - The agent name.
     * @returns {ClientAgent} The client agent instance.
     */
    getAgent: ((clientId: string, agentName: string) => ClientAgent) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientAgent>;
    /**
     * Executes an input command.
     * @param {string} input - The input command.
     * @returns {Promise<any>} The execution result.
     */
    execute: (input: string, mode: ExecutionMode) => Promise<void>;
    /**
     * Run the completion stateless
     * @param {string} input - The input command.
     * @returns {Promise<any>} The execution result.
     */
    run: (input: string) => Promise<string>;
    /**
     * Waits for the output from the agent.
     * @returns {Promise<any>} The output result.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Commits tool output.
     * @param {string} content - The tool output content.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @returns {Promise<any>} The commit result.
     */
    commitToolOutput: (toolId: string, content: string) => Promise<void>;
    /**
     * Commits an assistant message.
     * @param {string} message - The assistant message.
     * @returns {Promise<any>} The commit result.
     */
    commitSystemMessage: (message: string) => Promise<void>;
    /**
     * Commits a system message.
     * @param {string} message - The system message.
     * @returns {Promise<any>} The commit result.
     */
    commitAssistantMessage: (message: string) => Promise<void>;
    /**
     * Commits a user message without answer.
     * @param {string} message - The message.
     * @returns {Promise<any>} The commit result.
     */
    commitUserMessage: (message: string) => Promise<void>;
    /**
     * Commits agent change to prevent the next tool execution from being called.
     * @returns {Promise<any>} The commit result.
     */
    commitAgentChange: () => Promise<void>;
    /**
     * Prevent the next tool from being executed
     * @returns {Promise<any>} The commit result.
     */
    commitStopTools: () => Promise<void>;
    /**
     * Commits flush of agent history
     * @returns {Promise<any>} The commit result.
     */
    commitFlush: () => Promise<void>;
    /**
     * Disposes of the agent connection.
     * @returns {Promise<void>} The dispose result.
     */
    dispose: () => Promise<void>;
}

/**
 * Class representing the history of client messages, managing storage and retrieval of messages.
 * @implements {IHistory}
 */
declare class ClientHistory implements IHistory {
    readonly params: IHistoryParams;
    /**
     * Filter condition function for `toArrayForAgent`, used to filter messages based on agent-specific criteria.
     */
    _filterCondition: (message: IModelMessage) => boolean;
    /**
     * Creates an instance of ClientHistory.
     * Initializes the filter condition based on global configuration.
     * @param {IHistoryParams} params - The parameters for initializing the history.
     */
    constructor(params: IHistoryParams);
    /**
     * Pushes a message into the history and emits a corresponding event.
     * @param {IModelMessage} message - The message to add to the history.
     * @returns {Promise<void>}
     */
    push(message: IModelMessage): Promise<void>;
    /**
     * Removes and returns the most recent message from the history.
     * Emits an event with the popped message or null if the history is empty.
     * @returns {Promise<IModelMessage | null>} The most recent message, or null if the history is empty.
     */
    pop(): Promise<IModelMessage | null>;
    /**
     * Converts the history into an array of raw messages without any filtering or transformation.
     * @returns {Promise<IModelMessage[]>} An array of raw messages in the history.
     */
    toArrayForRaw(): Promise<IModelMessage[]>;
    /**
     * Converts the history into an array of messages tailored for the agent.
     * Filters messages based on the agent's filter condition, limits the number of messages,
     * and prepends prompt and system messages.
     * @param {string} prompt - The initial prompt message to prepend.
     * @param {string[] | undefined} system - Optional array of additional system messages to prepend.
     * @returns {Promise<IModelMessage[]>} An array of messages formatted for the agent.
     */
    toArrayForAgent(prompt: string, system?: string[]): Promise<IModelMessage[]>;
    /**
     * Disposes of the history, performing cleanup and releasing resources.
     * Should be called when the agent is being disposed.
     * @returns {Promise<void>}
     */
    dispose(): Promise<void>;
}

/**
 * Service for managing history connections.
 * @implements {IHistory}
 */
declare class HistoryConnectionService implements IHistory {
    private readonly loggerService;
    private readonly busService;
    private readonly methodContextService;
    private readonly sessionValidationService;
    /**
     * Retrieves the history for a given client and agent.
     * @param {string} clientId - The client ID.
     * @param {string} agentName - The agent name.
     * @returns {ClientHistory} The client history.
     */
    getHistory: ((clientId: string, agentName: string) => ClientHistory) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientHistory>;
    /**
     * Pushes a message to the history.
     * @param {IModelMessage} message - The message to push.
     * @returns {Promise<void>} A promise that resolves when the message is pushed.
     */
    push: (message: IModelMessage) => Promise<void>;
    /**
     * Pop a message from the history.
     * @returns {Promise<IModelMessage | null>} A promise that resolves when the message is popped.
     */
    pop: () => Promise<IModelMessage>;
    /**
     * Converts the history to an array for the agent.
     * @param {string} prompt - The prompt.
     * @returns {Promise<any[]>} A promise that resolves to an array for the agent.
     */
    toArrayForAgent: (prompt: string) => Promise<IModelMessage[]>;
    /**
     * Converts the history to a raw array.
     * @returns {Promise<any[]>} A promise that resolves to a raw array.
     */
    toArrayForRaw: () => Promise<IModelMessage[]>;
    /**
     * Disposes of the history connection service.
     * @returns {Promise<void>} A promise that resolves when the service is disposed.
     */
    dispose: () => Promise<void>;
}

/**
 * Service for managing agent schemas.
 */
declare class AgentSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    /**
     * Validation for agent schema
     */
    private validateShallow;
    /**
     * Registers a new agent schema.
     * @param {AgentName} key - The name of the agent.
     * @param {IAgentSchema} value - The schema of the agent.
     */
    register: (key: AgentName, value: IAgentSchema) => void;
    /**
     * Retrieves an agent schema by name.
     * @param {AgentName} key - The name of the agent.
     * @returns {IAgentSchema} The schema of the agent.
     */
    get: (key: AgentName) => IAgentSchema;
}

/**
 * Service for managing tool schemas.
 */
declare class ToolSchemaService {
    private readonly loggerService;
    private registry;
    /**
     * Validation for state schema
     */
    private validateShallow;
    /**
     * Registers a tool with the given key and value.
     * @param {ToolName} key - The name of the tool.
     * @param {IAgentTool} value - The tool to register.
     */
    register: (key: ToolName, value: IAgentTool) => void;
    /**
     * Retrieves a tool by its key.
     * @param {ToolName} key - The name of the tool.
     * @returns {IAgentTool} The tool associated with the given key.
     */
    get: (key: ToolName) => IAgentTool;
}

declare const AGENT_NEED_FETCH: unique symbol;
declare const STACK_NEED_FETCH: unique symbol;
/**
 * Manages a collection of agents within a swarm, handling agent switching, output waiting, and navigation.
 * @implements {ISwarm}
 */
declare class ClientSwarm implements ISwarm {
    readonly params: ISwarmParams;
    /**
     * Subject that emits when an agent reference changes, providing the agent name and instance.
     */
    _agentChangedSubject: Subject<[agentName: string, agent: IAgent]>;
    /**
     * The name of the currently active agent, or a symbol indicating it needs to be fetched.
     */
    _activeAgent: AgentName | typeof AGENT_NEED_FETCH;
    /**
     * The navigation stack of agent names, or a symbol indicating it needs to be fetched.
     */
    _navigationStack: AgentName[] | typeof STACK_NEED_FETCH;
    /**
     * Subject that emits to cancel output waiting, providing an empty output string.
     */
    _cancelOutputSubject: Subject<{
        agentName: string;
        output: string;
    }>;
    /**
     * Getter for the list of agent name-agent pairs from the agent map.
     * @returns {[string, IAgent][]} An array of tuples containing agent names and their instances.
     */
    get _agentList(): [string, IAgent][];
    /**
     * Creates an instance of ClientSwarm.
     * @param {ISwarmParams} params - The parameters for initializing the swarm, including agent map and callbacks.
     */
    constructor(params: ISwarmParams);
    /**
     * Pops the most recent agent from the navigation stack or returns the default agent if empty.
     * Updates the persisted navigation stack.
     * @returns {Promise<string>} The name of the previous agent, or the default agent if the stack is empty.
     */
    navigationPop(): Promise<string>;
    /**
     * Cancels the current output wait by emitting an empty string via the cancel subject.
     * @returns {Promise<void>} A promise that resolves when the cancellation is complete.
     */
    cancelOutput(): Promise<void>;
    /**
     * Waits for output from the active agent in a queued manner.
     * Handles cancellation and agent changes, ensuring only one wait operation at a time.
     * @returns {Promise<string>} The output from the active agent, or an empty string if canceled.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Retrieves the name of the active agent, fetching it if not yet loaded.
     * Emits an event with the result.
     * @returns {Promise<AgentName>} The name of the active agent.
     */
    getAgentName(): Promise<AgentName>;
    /**
     * Retrieves the active agent instance based on its name.
     * Emits an event with the result.
     * @returns {Promise<IAgent>} The active agent instance.
     */
    getAgent(): Promise<IAgent>;
    /**
     * Updates the reference to an agent in the swarm's agent map.
     * Notifies subscribers via the agent changed subject.
     * @param {AgentName} agentName - The name of the agent to update.
     * @param {IAgent} agent - The new agent instance.
     * @throws {Error} If the agent name is not found in the swarm's agent map.
     * @returns {Promise<void>} A promise that resolves when the update is complete.
     */
    setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
    /**
     * Sets the active agent by name, updates the navigation stack, and persists the change.
     * Invokes the onAgentChanged callback if provided.
     * @param {AgentName} agentName - The name of the agent to set as active.
     * @returns {Promise<void>} A promise that resolves when the agent is set and persisted.
     */
    setAgentName(agentName: AgentName): Promise<void>;
}

/**
 * Service for managing swarm connections.
 * @implements {ISwarm}
 */
declare class SwarmConnectionService implements ISwarm {
    private readonly loggerService;
    private readonly busService;
    private readonly methodContextService;
    private readonly agentConnectionService;
    private readonly swarmSchemaService;
    /**
     * Retrieves a swarm instance based on client ID and swarm name.
     * @param {string} clientId - The client ID.
     * @param {string} swarmName - The swarm name.
     * @returns {ClientSwarm} The client swarm instance.
     */
    getSwarm: ((clientId: string, swarmName: string) => ClientSwarm) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientSwarm>;
    /**
     * Pop the navigation stack or return default agent
     * @returns {Promise<string>} - The pending agent for navigation
     */
    navigationPop: () => Promise<string>;
    /**
     * Cancel the await of output by emit of empty string
     * @returns {Promise<void>}
     */
    cancelOutput: () => Promise<void>;
    /**
     * Waits for the output from the swarm.
     * @returns {Promise<any>} The output from the swarm.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Retrieves the agent name from the swarm.
     * @returns {Promise<string>} The agent name.
     */
    getAgentName: () => Promise<string>;
    /**
     * Retrieves the agent from the swarm.
     * @returns {Promise<IAgent>} The agent instance.
     */
    getAgent: () => Promise<IAgent>;
    /**
     * Sets the agent reference in the swarm.
     * @param {AgentName} agentName - The name of the agent.
     * @param {IAgent} agent - The agent instance.
     * @returns {Promise<void>}
     */
    setAgentRef: (agentName: AgentName, agent: IAgent) => Promise<void>;
    /**
     * Sets the agent name in the swarm.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<void>}
     */
    setAgentName: (agentName: AgentName) => Promise<void>;
    /**
     * Disposes of the swarm connection.
     * @returns {Promise<void>}
     */
    dispose: () => Promise<void>;
}

/**
 * Service for managing swarm schemas.
 */
declare class SwarmSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    /**
     * Validation for swarm schema
     */
    private validateShallow;
    /**
     * Registers a new swarm schema.
     * @param {SwarmName} key - The name of the swarm.
     * @param {ISwarmSchema} value - The schema of the swarm.
     */
    register: (key: SwarmName, value: ISwarmSchema) => void;
    /**
     * Retrieves a swarm schema by its name.
     * @param {SwarmName} key - The name of the swarm.
     * @returns {ISwarmSchema} The schema of the swarm.
     */
    get: (key: SwarmName) => ISwarmSchema;
}

/**
 * Service for managing completion schemas.
 */
declare class CompletionSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    /**
     * Validation for completion schemaschema
     */
    private validateShallow;
    /**
     * Registers a new completion schema.
     * @param {CompletionName} key - The key for the schema.
     * @param {ICompletionSchema} value - The schema to register.
     */
    register: (key: CompletionName, value: ICompletionSchema) => void;
    /**
     * Retrieves a completion schema by key.
     * @param {CompletionName} key - The key of the schema to retrieve.
     * @returns {ICompletionSchema} The retrieved schema.
     */
    get: (key: CompletionName) => ICompletionSchema;
}

/**
 * Represents a client session for managing message execution, emission, and agent interactions.
 * @implements {ISession}
 */
declare class ClientSession implements ISession {
    readonly params: ISessionParams;
    /**
     * Subject for emitting output messages to subscribers.
     */
    readonly _emitSubject: Subject<string>;
    /**
     * Constructs a new ClientSession instance.
     * Invokes the onInit callback if provided.
     * @param {ISessionParams} params - The parameters for initializing the session.
     */
    constructor(params: ISessionParams);
    /**
     * Emits a message to subscribers after validating it against the policy.
     * If validation fails, emits the ban message instead.
     * @param {string} message - The message to emit.
     * @returns {Promise<void>}
     */
    emit(message: string): Promise<void>;
    /**
     * Executes a message using the swarm's agent and returns the output.
     * Validates input and output against the policy, returning a ban message if either fails.
     * @param {string} message - The message to execute.
     * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool").
     * @returns {Promise<string>} The output of the execution, or a ban message if validation fails.
     */
    execute(message: string, mode: ExecutionMode): Promise<string>;
    /**
     * Runs a stateless completion of a message using the swarm's agent and returns the output.
     * Does not emit the result but logs the execution via the event bus.
     * @param {string} message - The message to run.
     * @returns {Promise<string>} The output of the completion.
     */
    run(message: string): Promise<string>;
    /**
     * Commits tool output to the agent's history via the swarm.
     * @param {string} toolId - The ID of the tool call (e.g., `tool_call_id` for OpenAI history).
     * @param {string} content - The tool output content to commit.
     * @returns {Promise<void>}
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Commits a user message to the agent's history without triggering a response.
     * @param {string} message - The user message to commit.
     * @returns {Promise<void>}
     */
    commitUserMessage(message: string): Promise<void>;
    /**
     * Commits a flush of the agent's history, clearing it.
     * @returns {Promise<void>}
     */
    commitFlush(): Promise<void>;
    /**
     * Signals the agent to stop the execution of subsequent tools.
     * @returns {Promise<void>}
     */
    commitStopTools(): Promise<void>;
    /**
     * Commits a system message to the agent's history.
     * @param {string} message - The system message to commit.
     * @returns {Promise<void>}
     */
    commitSystemMessage(message: string): Promise<void>;
    /**
     * Commits an assistant message to the agent's history without triggering execution.
     * @param {string} message - The assistant message to commit.
     * @returns {Promise<void>}
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Connects the session to a message connector, subscribing to emitted messages and returning a receiver function.
     * @param {SendMessageFn} connector - The function to handle outgoing messages.
     * @returns {ReceiveMessageFn<string>} A function to receive incoming messages and process them.
     */
    connect(connector: SendMessageFn$1): ReceiveMessageFn<string>;
    /**
     * Disposes of the session, performing cleanup and invoking the onDispose callback if provided.
     * Should be called when the session is no longer needed.
     * @returns {Promise<void>}
     */
    dispose(): Promise<void>;
}

/**
 * Service for managing session connections.
 * @implements {ISession}
 */
declare class SessionConnectionService implements ISession {
    private readonly loggerService;
    private readonly busService;
    private readonly methodContextService;
    private readonly swarmConnectionService;
    private readonly policyConnectionService;
    private readonly swarmSchemaService;
    /**
     * Retrieves a memoized session based on clientId and swarmName.
     * @param {string} clientId - The client ID.
     * @param {string} swarmName - The swarm name.
     * @returns {ClientSession} The client session.
     */
    getSession: ((clientId: string, swarmName: string) => ClientSession) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientSession>;
    /**
     * Emits a message to the session.
     * @param {string} content - The content to emit.
     * @returns {Promise<void>} A promise that resolves when the message is emitted.
     */
    emit: (content: string) => Promise<void>;
    /**
     * Executes a command in the session.
     * @param {string} content - The content to execute.
     * @returns {Promise<string>} A promise that resolves with the execution result.
     */
    execute: (content: string, mode: ExecutionMode) => Promise<string>;
    /**
     * Run the completion stateless
     * @param {string} content - The content to execute.
     * @returns {Promise<string>} A promise that resolves with the execution result.
     */
    run: (content: string) => Promise<string>;
    /**
     * Connects to the session using the provided connector.
     * @param {SendMessageFn} connector - The function to send messages.
     * @returns {ReceiveMessageFn} The function to receive messages.
     */
    connect: (connector: SendMessageFn$1, clientId: string, swarmName: SwarmName) => ReceiveMessageFn<string>;
    /**
     * Commits tool output to the session.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param {string} content - The content to commit.
     * @returns {Promise<void>} A promise that resolves when the content is committed.
     */
    commitToolOutput: (toolId: string, content: string) => Promise<void>;
    /**
     * Commits a system message to the session.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     */
    commitSystemMessage: (message: string) => Promise<void>;
    /**
     * Commits an assistant message to the session.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     */
    commitAssistantMessage: (message: string) => Promise<void>;
    /**
     * Commits user message to the agent without answer.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     */
    commitUserMessage: (message: string) => Promise<void>;
    /**
     * Commits user message to the agent without answer.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     */
    commitFlush: () => Promise<void>;
    /**
     * Commits user message to the agent without answer.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>} A promise that resolves when the message is committed.
     */
    commitStopTools: () => Promise<void>;
    /**
     * Disposes of the session connection service.
     * @returns {Promise<void>} A promise that resolves when the service is disposed.
     */
    dispose: () => Promise<void>;
}

interface IAgentConnectionService extends AgentConnectionService {
}
type InternalKeys$8 = keyof {
    getAgent: never;
};
type TAgentConnectionService = {
    [key in Exclude<keyof IAgentConnectionService, InternalKeys$8>]: unknown;
};
/**
 * Service for managing public agent operations.
 */
declare class AgentPublicService implements TAgentConnectionService {
    private readonly loggerService;
    private readonly agentConnectionService;
    /**
     * Creates a reference to an agent.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The agent reference.
     */
    createAgentRef: (methodName: string, clientId: string, agentName: AgentName) => Promise<ClientAgent>;
    /**
     * Executes a command on the agent.
     * @param {string} input - The input command.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The execution result.
     */
    execute: (input: string, mode: ExecutionMode, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Run the completion stateless
     * @param {string} input - The input command.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The execution result.
     */
    run: (input: string, methodName: string, clientId: string, agentName: AgentName) => Promise<string>;
    /**
     * Waits for the agent's output.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The output result.
     */
    waitForOutput: (methodName: string, clientId: string, agentName: AgentName) => Promise<string>;
    /**
     * Commits tool output to the agent.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param {string} content - The content to commit.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitToolOutput: (toolId: string, content: string, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits a system message to the agent.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitSystemMessage: (message: string, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits an assistant message to the agent history.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitAssistantMessage: (message: string, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits user message to the agent without answer.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitUserMessage: (message: string, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits flush of agent history
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitFlush: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits change of agent to prevent the next tool execution from being called.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitAgentChange: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Prevent the next tool from being executed
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitStopTools: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Disposes of the agent.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The dispose result.
     */
    dispose: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
}

interface IHistoryConnectionService extends HistoryConnectionService {
}
type InternalKeys$7 = keyof {
    getHistory: never;
    getItems: never;
};
type THistoryConnectionService = {
    [key in Exclude<keyof IHistoryConnectionService, InternalKeys$7>]: unknown;
};
/**
 * Service for handling public history operations.
 */
declare class HistoryPublicService implements THistoryConnectionService {
    private readonly loggerService;
    private readonly historyConnectionService;
    /**
     * Pushes a message to the history.
     * @param {IModelMessage} message - The message to push.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    push: (message: IModelMessage, methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Pushes a message to the history.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @returns {Promise<IModelMessage | null>} A promise that resolves when the operation is complete.
     */
    pop: (methodName: string, clientId: string, agentName: AgentName) => Promise<IModelMessage>;
    /**
     * Converts history to an array for a specific agent.
     * @param {string} prompt - The prompt.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @returns {Promise<any[]>} A promise that resolves to an array of history items.
     */
    toArrayForAgent: (prompt: string, methodName: string, clientId: string, agentName: AgentName) => Promise<IModelMessage[]>;
    /**
     * Converts history to a raw array.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @returns {Promise<any[]>} A promise that resolves to a raw array of history items.
     */
    toArrayForRaw: (methodName: string, clientId: string, agentName: AgentName) => Promise<IModelMessage[]>;
    /**
     * Disposes of the history.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    dispose: (methodName: string, clientId: string, agentName: AgentName) => Promise<void>;
}

interface ISessionConnectionService extends SessionConnectionService {
}
type InternalKeys$6 = keyof {
    getSession: never;
};
type TSessionConnectionService = {
    [key in Exclude<keyof ISessionConnectionService, InternalKeys$6>]: unknown;
};
/**
 * Service for managing public session interactions.
 */
declare class SessionPublicService implements TSessionConnectionService {
    private readonly loggerService;
    private readonly perfService;
    private readonly sessionConnectionService;
    private readonly busService;
    /**
     * Emits a message to the session.
     * @param {string} content - The content to emit.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    emit: (content: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Executes a command in the session.
     * @param {string} content - The content to execute.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    execute: (content: string, mode: ExecutionMode, methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Run the completion stateless
     * @param {string} content - The content to execute.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    run: (content: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Connects to the session.
     * @param {SendMessageFn} connector - The function to send messages.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {ReceiveMessageFn}
     */
    connect: (connector: SendMessageFn$1, methodName: string, clientId: string, swarmName: SwarmName) => ReceiveMessageFn<string>;
    /**
     * Commits tool output to the session.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param {string} content - The content to commit.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    commitToolOutput: (toolId: string, content: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits a system message to the session.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    commitSystemMessage: (message: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits an assistant message to the session.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>``}
     */
    commitAssistantMessage: (message: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits user message to the agent without answer.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    commitUserMessage: (message: string, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits flush of agent history
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    commitFlush: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Prevent the next tool from being executed
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    commitStopTools: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Disposes of the session.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    dispose: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
}

interface ISwarmConnectionService extends SwarmConnectionService {
}
type InternalKeys$5 = keyof {
    getSwarm: never;
};
type TSwarmConnectionService = {
    [key in Exclude<keyof ISwarmConnectionService, InternalKeys$5>]: unknown;
};
/**
 * Service for managing public swarm interactions.
 */
declare class SwarmPublicService implements TSwarmConnectionService {
    private readonly loggerService;
    private readonly swarmConnectionService;
    /**
     * Pop the navigation stack or return default agent
     * @returns {Promise<string>} - The pending agent for navigation
     */
    navigationPop: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Cancel the await of output by emit of empty string
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    cancelOutput: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Waits for output from the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    waitForOutput: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Gets the agent name from the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<string>}
     */
    getAgentName: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Gets the agent from the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<IAgent>}
     */
    getAgent: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<IAgent>;
    /**
     * Sets the agent reference in the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @param {AgentName} agentName - The agent name.
     * @param {IAgent} agent - The agent instance.
     * @returns {Promise<void>}
     */
    setAgentRef: (methodName: string, clientId: string, swarmName: SwarmName, agentName: AgentName, agent: IAgent) => Promise<void>;
    /**
     * Sets the agent name in the swarm.
     * @param {AgentName} agentName - The agent name.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    setAgentName: (agentName: AgentName, methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Disposes of the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    dispose: (methodName: string, clientId: string, swarmName: SwarmName) => Promise<void>;
}

/**
 * Service for validating agents within the agent swarm.
 */
declare class AgentValidationService {
    private readonly loggerService;
    private readonly toolValidationService;
    private readonly completionValidationService;
    private readonly storageValidationService;
    private _agentMap;
    private _agentDepsMap;
    getAgentList: () => string[];
    /**
     * Retrieves the storages used by the agent
     * @param {agentName} agentName - The name of the swarm.
     * @returns {string[]} The list of storage names.
     * @throws Will throw an error if the swarm is not found.
     */
    getStorageList: (agentName: string) => string[];
    /**
     * Retrieves the states used by the agent
     * @param {agentName} agentName - The name of the swarm.
     * @returns {string[]} The list of state names.
     * @throws Will throw an error if the swarm is not found.
     */
    getStateList: (agentName: string) => string[];
    /**
     * Adds a new agent to the validation service.
     * @param {AgentName} agentName - The name of the agent.
     * @param {IAgentSchema} agentSchema - The schema of the agent.
     * @throws {Error} If the agent already exists.
     */
    addAgent: (agentName: AgentName, agentSchema: IAgentSchema) => void;
    /**
     * Check if agent got registered storage
     */
    hasStorage: ((agentName: AgentName, storageName: StorageName) => boolean) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, boolean>;
    /**
     * Check if agent got registered dependency
     */
    hasDependency: ((targetAgentName: AgentName, depAgentName: StorageName) => boolean) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, boolean>;
    /**
     * Check if agent got registered state
     */
    hasState: ((agentName: AgentName, stateName: StateName) => boolean) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, boolean>;
    /**
     * Validates an agent by its name and source.
     * @param {AgentName} agentName - The name of the agent.
     * @param {string} source - The source of the validation request.
     * @throws {Error} If the agent is not found.
     */
    validate: (agentName: AgentName, source: string) => void;
}

/**
 * Service for validating tools within the agent-swarm.
 */
declare class ToolValidationService {
    private readonly loggerService;
    private _toolMap;
    /**
     * Adds a new tool to the validation service.
     * @param {ToolName} toolName - The name of the tool to add.
     * @param {IAgentTool} toolSchema - The schema of the tool to add.
     * @throws Will throw an error if the tool already exists.
     */
    addTool: (toolName: ToolName, toolSchema: IAgentTool) => void;
    /**
     * Validates if a tool exists in the validation service.
     * @param {ToolName} toolName - The name of the tool to validate.
     * @param {string} source - The source of the validation request.
     * @throws Will throw an error if the tool is not found.
     */
    validate: (toolName: ToolName, source: string) => void;
}

/**
 * Service for validating and managing sessions.
 */
declare class SessionValidationService {
    private readonly loggerService;
    private _storageSwarmMap;
    private _historySwarmMap;
    private _agentSwarmMap;
    private _stateSwarmMap;
    private _sessionSwarmMap;
    private _sessionModeMap;
    /**
     * Adds a new session.
     * @param {SessionId} clientId - The ID of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {SessionMode} sessionMode - The mode of the session.
     * @throws Will throw an error if the session already exists.
     */
    addSession: (clientId: SessionId, swarmName: SwarmName, sessionMode: SessionMode) => void;
    /**
     * Adds an agent usage to a session.
     * @param {SessionId} sessionId - The ID of the session.
     * @param {AgentName} agentName - The name of the agent.
     */
    addAgentUsage: (sessionId: SessionId, agentName: AgentName) => void;
    /**
     * Adds a history usage to a session.
     * @param {SessionId} sessionId - The ID of the session.
     * @param {AgentName} agentName - The name of the agent.
     */
    addHistoryUsage: (sessionId: SessionId, agentName: AgentName) => void;
    /**
     * Adds a storage usage to a session.
     * @param {SessionId} sessionId - The ID of the session.
     * @param {StorageName} storageName - The name of the storage.
     */
    addStorageUsage: (sessionId: SessionId, storageName: StorageName) => void;
    /**
     * Adds a state usage to a session.
     * @param {SessionId} sessionId - The ID of the session.
     * @param {StateName} stateName - The name of the state.
     */
    addStateUsage: (sessionId: SessionId, stateName: StateName) => void;
    /**
     * Removes an agent usage from a session.
     * @param {SessionId} sessionId - The ID of the session.
     * @param {AgentName} agentName - The name of the agent.
     * @throws Will throw an error if no agents are found for the session.
     */
    removeAgentUsage: (sessionId: SessionId, agentName: AgentName) => void;
    /**
     * Removes a history usage from a session.
     * @param {SessionId} sessionId - The ID of the session.
     * @param {AgentName} agentName - The name of the agent.
     * @throws Will throw an error if no agents are found for the session.
     */
    removeHistoryUsage: (sessionId: SessionId, agentName: AgentName) => void;
    /**
     * Removes a storage usage from a session.
     * @param {SessionId} sessionId - The ID of the session.
     * @param {StorageName} storageName - The name of the storage.
     * @throws Will throw an error if no storages are found for the session.
     */
    removeStorageUsage: (sessionId: SessionId, storageName: StorageName) => void;
    /**
     * Removes a state usage from a session.
     * @param {SessionId} sessionId - The ID of the session.
     * @param {StateName} stateName - The name of the state.
     * @throws Will throw an error if no states are found for the session.
     */
    removeStateUsage: (sessionId: SessionId, stateName: StateName) => void;
    /**
     * Gets the mode of a session.
     * @param {SessionId} clientId - The ID of the client.
     * @returns {SessionMode} The mode of the session.
     * @throws Will throw an error if the session does not exist.
     */
    getSessionMode: (clientId: SessionId) => SessionMode;
    /**
     * Ensures session is exist
     * @returns {boolean}
     */
    hasSession: (clientId: SessionId) => boolean;
    /**
     * Gets the list of all session IDs.
     * @returns {SessionId[]} The list of session IDs.
     */
    getSessionList: () => string[];
    /**
     * Gets the list of agents for a session.
     * @param {string} clientId - The ID of the client.
     * @returns {AgentName[]} The list of agent names.
     */
    getSessionAgentList: (clientId: string) => string[];
    /**
     * Gets the history list of agents for a session.
     * @param {string} clientId - The ID of the client.
     * @returns {AgentName[]} The list of agent names.
     */
    getSessionHistoryList: (clientId: string) => string[];
    /**
     * Gets the swarm name for a session.
     * @param {SessionId} clientId - The ID of the client.
     * @returns {SwarmName} The name of the swarm.
     * @throws Will throw an error if the session does not exist.
     */
    getSwarm: (clientId: SessionId) => string;
    /**
     * Validates if a session exists.
     * @param {SessionId} clientId - The ID of the client.
     * @param {string} source - The source of the validation request.
     * @throws Will throw an error if the session does not exist.
     */
    validate: ((clientId: SessionId, source: string) => void) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, void>;
    /**
     * Removes a session.
     * @param {SessionId} clientId - The ID of the client.
     */
    removeSession: (clientId: SessionId) => void;
    /**
     * Dispose a session validation cache.
     * @param {SessionId} clientId - The ID of the client.
     */
    dispose: (clientId: string) => void;
}

/**
 * Service for validating swarms and their agents.
 */
declare class SwarmValidationService {
    private readonly loggerService;
    private readonly agentValidationService;
    private readonly policyValidationService;
    private _swarmMap;
    /**
     * Adds a new swarm to the swarm map.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {ISwarmSchema} swarmSchema - The schema of the swarm.
     * @throws Will throw an error if the swarm already exists.
     */
    addSwarm: (swarmName: SwarmName, swarmSchema: ISwarmSchema) => void;
    /**
     * Retrieves the list of agents for a given swarm.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {string[]} The list of agent names.
     * @throws Will throw an error if the swarm is not found.
     */
    getAgentList: (swarmName: SwarmName) => string[];
    /**
     * Retrieves the list of ban policies for a given swarm.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {string[]} The list of policy names.
     * @throws Will throw an error if the swarm is not found.
     */
    getPolicyList: (swarmName: SwarmName) => string[];
    /**
     * Retrieves the list of swarms
     * @returns {string[]} The list of swarm names
     */
    getSwarmList: () => string[];
    /**
     * Validates a swarm and its agents.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {string} source - The source of the validation request.
     * @throws Will throw an error if the swarm is not found or if the default agent is not in the agent list.
     */
    validate: (swarmName: SwarmName, source: string) => void;
}

/**
 * Service for validating completion names.
 */
declare class CompletionValidationService {
    private readonly loggerService;
    private _completionSet;
    /**
     * Adds a new completion name to the set.
     * @param {CompletionName} completionName - The name of the completion to add.
     * @throws Will throw an error if the completion name already exists.
     */
    addCompletion: (completionName: CompletionName) => void;
    /**
     * Validates if a completion name exists in the set.
     * @param {CompletionName} completionName - The name of the completion to validate.
     * @param {string} source - The source of the validation request.
     * @throws Will throw an error if the completion name is not found.
     */
    validate: (completionName: CompletionName, source: string) => void;
}

/**
 * Service for managing embedding schemas.
 */
declare class EmbeddingSchemaService {
    private readonly loggerService;
    private registry;
    /**
     * Validation for embedding schema
     */
    private validateShallow;
    /**
     * Registers a embedding with the given key and value.
     * @param {EmbeddingName} key - The name of the embedding.
     * @param {IAgentTool} value - The embedding to register.
     */
    register: (key: EmbeddingName, value: IEmbeddingSchema) => void;
    /**
     * Retrieves a embedding by its key.
     * @param {EmbeddingName} key - The name of the embedding.
     * @returns {IAgentTool} The embedding associated with the given key.
     */
    get: (key: EmbeddingName) => IEmbeddingSchema;
}

/**
 * Service for managing storage schemas.
 */
declare class StorageSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    /**
     * Validation for storage schema
     */
    private validateShallow;
    /**
     * Registers a new storage schema.
     * @param {StorageName} key - The key for the schema.
     * @param {IStorageSchema} value - The schema to register.
     */
    register: (key: StorageName, value: IStorageSchema) => void;
    /**
     * Retrieves a storage schema by key.
     * @param {StorageName} key - The key of the schema to retrieve.
     * @returns {IStorageSchema} The retrieved schema.
     */
    get: (key: StorageName) => IStorageSchema;
}

/**
 * Type representing possible storage actions.
 */
type Action = "upsert" | "remove" | "clear";
/**
 * Type representing the payload for storage actions.
 * @template T - The type of storage data, extending IStorageData.
 */
type Payload<T extends IStorageData = IStorageData> = {
    /** The ID of the item. */
    itemId: IStorageData["id"];
    /** The item data to upsert. */
    item: T;
};
/**
 * Class managing storage operations with embedding-based search capabilities.
 * Supports upserting, removing, and searching items with similarity scoring.
 * @template T - The type of storage data, extending IStorageData.
 * @implements {IStorage<T>}
 */
declare class ClientStorage<T extends IStorageData = IStorageData> implements IStorage<T> {
    readonly params: IStorageParams<T>;
    /** Internal map to store items by their IDs. */
    _itemMap: Map<string | number, T>;
    /**
     * Creates an instance of ClientStorage.
     * Invokes the onInit callback if provided.
     * @param {IStorageParams<T>} params - The storage parameters, including client ID, storage name, and callback functions.
     */
    constructor(params: IStorageParams<T>);
    /**
     * Dispatches a storage action (upsert, remove, or clear) in a queued manner.
     * @param {Action} action - The action to perform ("upsert", "remove", or "clear").
     * @param {Partial<Payload<T>>} payload - The payload for the action (item or itemId).
     * @returns {Promise<void>} A promise that resolves when the action is complete.
     */
    dispatch: (action: Action, payload: Partial<Payload<T>>) => Promise<void>;
    /**
     * Creates embeddings for the given item, memoized by item ID to avoid redundant calculations.
     * @param {T} item - The item to create embeddings for.
     * @returns {Promise<readonly [any, any]>} A tuple of embeddings and index.
     * @private
     */
    _createEmbedding: ((item: T) => Promise<readonly [Embeddings, string]>) & functools_kit.IClearableMemoize<string | number> & functools_kit.IControlMemoize<string | number, Promise<readonly [Embeddings, string]>>;
    /**
     * Waits for the initialization of the storage, loading initial data and creating embeddings.
     * Ensures initialization happens only once using singleshot.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    waitForInit: (() => Promise<void>) & functools_kit.ISingleshotClearable;
    /**
     * Retrieves a specified number of items based on similarity to a search string.
     * Uses embeddings and similarity scoring to sort and filter results.
     * @param {string} search - The search string to compare against stored items.
     * @param {number} total - The maximum number of items to return.
     * @param {number} [score=GLOBAL_CONFIG.CC_STORAGE_SEARCH_SIMILARITY] - The minimum similarity score for items to be included (defaults to global config).
     * @returns {Promise<T[]>} An array of items sorted by similarity, limited to the specified total and score threshold.
     */
    take(search: string, total: number, score?: number): Promise<T[]>;
    /**
     * Upserts an item into the storage via the dispatch queue.
     * @param {T} item - The item to upsert.
     * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
     */
    upsert(item: T): Promise<void>;
    /**
     * Removes an item from the storage by its ID via the dispatch queue.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @returns {Promise<void>} A promise that resolves when the remove operation is complete.
     */
    remove(itemId: IStorageData["id"]): Promise<void>;
    /**
     * Clears all items from the storage via the dispatch queue.
     * @returns {Promise<void>} A promise that resolves when the clear operation is complete.
     */
    clear(): Promise<void>;
    /**
     * Retrieves an item from the storage by its ID.
     * Emits an event with the result.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
     * @returns {Promise<T | null>} The item if found, or null if not found.
     */
    get(itemId: IStorageData["id"]): Promise<T | null>;
    /**
     * Lists all items in the storage, optionally filtered by a predicate.
     * Emits an event with the filtered result if a filter is provided.
     * @param {(item: T) => boolean} [filter] - An optional predicate to filter items.
     * @returns {Promise<T[]>} An array of items, filtered if a predicate is provided.
     */
    list(filter?: (item: T) => boolean): Promise<T[]>;
    /**
     * Disposes of the storage instance, invoking the onDispose callback if provided.
     * @returns {Promise<void>} A promise that resolves when disposal is complete.
     */
    dispose(): Promise<void>;
}

/**
 * Service for managing storage connections.
 * @implements {IStorage}
 */
declare class StorageConnectionService implements IStorage {
    private readonly loggerService;
    private readonly busService;
    private readonly methodContextService;
    private readonly storageSchemaService;
    private readonly sessionValidationService;
    private readonly embeddingSchemaService;
    private readonly sharedStorageConnectionService;
    private _sharedStorageSet;
    /**
     * Retrieves a storage instance based on client ID and storage name.
     * @param {string} clientId - The client ID.
     * @param {string} storageName - The storage name.
     * @returns {ClientStorage} The client storage instance.
     */
    getStorage: ((clientId: string, storageName: StorageName) => ClientStorage<any>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientStorage<any>>;
    /**
     * Retrieves a list of storage data based on a search query and total number of items.
     * @param {string} search - The search query.
     * @param {number} total - The total number of items to retrieve.
     * @returns {Promise<IStorageData[]>} The list of storage data.
     */
    take: (search: string, total: number, score?: number) => Promise<IStorageData[]>;
    /**
     * Upserts an item in the storage.
     * @param {IStorageData} item - The item to upsert.
     * @returns {Promise<void>}
     */
    upsert: (item: IStorageData) => Promise<void>;
    /**
     * Removes an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @returns {Promise<void>}
     */
    remove: (itemId: IStorageData["id"]) => Promise<void>;
    /**
     * Retrieves an item from the storage by its ID.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
     * @returns {Promise<IStorageData>} The retrieved item.
     */
    get: (itemId: IStorageData["id"]) => Promise<IStorageData | null>;
    /**
     * Retrieves a list of items from the storage, optionally filtered by a predicate function.
     * @param {function(IStorageData): boolean} [filter] - The optional filter function.
     * @returns {Promise<IStorageData[]>} The list of items.
     */
    list: (filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>;
    /**
     * Clears all items from the storage.
     * @returns {Promise<void>}
     */
    clear: () => Promise<void>;
    /**
     * Disposes of the storage connection.
     * @returns {Promise<void>}
     */
    dispose: () => Promise<void>;
}

interface IStorageConnectionService extends StorageConnectionService {
}
type InternalKeys$4 = keyof {
    getStorage: never;
    getSharedStorage: never;
};
type TStorageConnectionService = {
    [key in Exclude<keyof IStorageConnectionService, InternalKeys$4>]: unknown;
};
/**
 * Service for managing public storage interactions.
 */
declare class StoragePublicService implements TStorageConnectionService {
    private readonly loggerService;
    private readonly storageConnectionService;
    /**
     * Retrieves a list of storage data based on a search query and total number of items.
     * @param {string} search - The search query.
     * @param {number} total - The total number of items to retrieve.
     * @returns {Promise<IStorageData[]>} The list of storage data.
     */
    take: (search: string, total: number, methodName: string, clientId: string, storageName: StorageName, score?: number) => Promise<IStorageData[]>;
    /**
     * Upserts an item in the storage.
     * @param {IStorageData} item - The item to upsert.
     * @returns {Promise<void>}
     */
    upsert: (item: IStorageData, methodName: string, clientId: string, storageName: StorageName) => Promise<void>;
    /**
     * Removes an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @returns {Promise<void>}
     */
    remove: (itemId: IStorageData["id"], methodName: string, clientId: string, storageName: StorageName) => Promise<void>;
    /**
     * Retrieves an item from the storage by its ID.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
     * @returns {Promise<IStorageData>} The retrieved item.
     */
    get: (itemId: IStorageData["id"], methodName: string, clientId: string, storageName: StorageName) => Promise<IStorageData | null>;
    /**
     * Retrieves a list of items from the storage, optionally filtered by a predicate function.
     * @param {function(IStorageData): boolean} [filter] - The optional filter function.
     * @returns {Promise<IStorageData[]>} The list of items.
     */
    list: (methodName: string, clientId: string, storageName: StorageName, filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>;
    /**
     * Clears all items from the storage.
     * @returns {Promise<void>}
     */
    clear: (methodName: string, clientId: string, storageName: StorageName) => Promise<void>;
    /**
     * Disposes of the storage.
     * @param {string} clientId - The client ID.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<void>}
     */
    dispose: (methodName: string, clientId: string, storageName: StorageName) => Promise<void>;
}

/**
 * Service for validating storages within the storage swarm.
 */
declare class StorageValidationService {
    private readonly loggerService;
    private readonly embeddingValidationService;
    private _storageMap;
    /**
     * Adds a new storage to the validation service.
     * @param {StorageName} storageName - The name of the storage.
     * @param {IStorageSchema} storageSchema - The schema of the storage.
     * @throws {Error} If the storage already exists.
     */
    addStorage: (storageName: StorageName, storageSchema: IStorageSchema) => void;
    /**
     * Validates an storage by its name and source.
     * @param {StorageName} storageName - The name of the storage.
     * @param {string} source - The source of the validation request.
     * @throws {Error} If the storage is not found.
     */
    validate: (storageName: StorageName, source: string) => void;
}

/**
 * Service for validating embeddings within the agent-swarm.
 */
declare class EmbeddingValidationService {
    private readonly loggerService;
    private _embeddingMap;
    /**
     * Adds a new embedding to the validation service.
     * @param {EmbeddingName} embeddingName - The name of the embedding to add.
     * @param {IAgentEmbedding} embeddingSchema - The schema of the embedding to add.
     * @throws Will throw an error if the embedding already exists.
     */
    addEmbedding: (embeddingName: EmbeddingName, embeddingSchema: IEmbeddingSchema) => void;
    /**
     * Validates if a embedding exists in the validation service.
     * @param {EmbeddingName} embeddingName - The name of the embedding to validate.
     * @param {string} source - The source of the validation request.
     * @throws Will throw an error if the embedding is not found.
     */
    validate: (embeddingName: EmbeddingName, source: string) => void;
}

type DispatchFn<State extends IStateData = IStateData> = (prevState: State) => Promise<State>;
/**
 * Class representing the client state, managing state data with read/write operations.
 * @template State - The type of the state data, extending IStateData.
 * @implements {IState<State>}
 */
declare class ClientState<State extends IStateData = IStateData> implements IState<State> {
    readonly params: IStateParams<State>;
    /**
     * The current state data, initialized as null and set during waitForInit.
     */
    _state: State;
    /**
     * Queued dispatch function to read or write the state.
     * @param {string} action - The action to perform ("read" or "write").
     * @param {DispatchFn<State>} [payload] - The function to update the state (required for "write").
     * @returns {Promise<State>} The current or updated state.
     */
    dispatch: (action: string, payload?: DispatchFn<State>) => Promise<State>;
    /**
     * Creates an instance of ClientState.
     * Invokes the onInit callback if provided.
     * @param {IStateParams<State>} params - The parameters for initializing the state.
     */
    constructor(params: IStateParams<State>);
    /**
     * Waits for the state to initialize, ensuring it’s only called once.
     * Uses singleshot to prevent multiple initializations.
     * @returns {Promise<void>}
     */
    waitForInit: (() => Promise<void>) & functools_kit.ISingleshotClearable;
    /**
     * Sets the state using the provided dispatch function, applying middlewares and persisting the result.
     * Invokes the onWrite callback and emits an event if configured.
     * @param {DispatchFn<State>} dispatchFn - The function to update the state.
     * @returns {Promise<State>} The updated state.
     */
    setState(dispatchFn: DispatchFn<State>): Promise<State>;
    /**
     * Resets the state to its initial value as determined by getState and getDefaultState.
     * Persists the result and invokes the onWrite callback if configured.
     * @returns {Promise<State>} The reset state.
     */
    clearState(): Promise<State>;
    /**
     * Retrieves the current state.
     * Invokes the onRead callback and emits an event if configured.
     * @returns {Promise<State>} The current state.
     */
    getState(): Promise<State>;
    /**
     * Disposes of the state, performing cleanup and invoking the onDispose callback if provided.
     * @returns {Promise<void>}
     */
    dispose(): Promise<void>;
}

/**
 * Service for managing state connections.
 * @template T - The type of state data.
 * @implements {IState<T>}
 */
declare class StateConnectionService<T extends IStateData = IStateData> implements IState<T> {
    private readonly loggerService;
    private readonly busService;
    private readonly methodContextService;
    private readonly stateSchemaService;
    private readonly sessionValidationService;
    private readonly sharedStateConnectionService;
    private _sharedStateSet;
    /**
     * Memoized function to get a state reference.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The state name.
     * @returns {ClientState} The client state.
     */
    getStateRef: ((clientId: string, stateName: StateName) => ClientState<any>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientState<any>>;
    /**
     * Sets the state.
     * @param {function(T): Promise<T>} dispatchFn - The function to dispatch the new state.
     * @returns {Promise<T>} The new state.
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;
    /**
     * Set the state to initial value
     * @returns {Promise<T>} The initial state.
     */
    clearState: () => Promise<T>;
    /**
     * Gets the state.
     * @returns {Promise<T>} The current state.
     */
    getState: () => Promise<T>;
    /**
     * Disposes the state connection.
     * @returns {Promise<void>}
     */
    dispose: () => Promise<void>;
}

interface IStateConnectionService extends StateConnectionService {
}
type InternalKeys$3 = keyof {
    getStateRef: never;
    getSharedStateRef: never;
};
type TStateConnectionService = {
    [key in Exclude<keyof IStateConnectionService, InternalKeys$3>]: unknown;
};
declare class StatePublicService<T extends IStateData = IStateData> implements TStateConnectionService {
    private readonly loggerService;
    private readonly stateConnectionService;
    /**
     * Sets the state using the provided dispatch function.
     * @param {function(T): Promise<T>} dispatchFn - The function to dispatch the state change.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     * @returns {Promise<T>} - The updated state.
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>, methodName: string, clientId: string, stateName: StateName) => Promise<T>;
    /**
     * Set the state to initial value
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     * @returns {Promise<T>} - The initial state.
     */
    clearState: (methodName: string, clientId: string, stateName: StateName) => Promise<T>;
    /**
     * Gets the current state.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     * @returns {Promise<T>} - The current state.
     */
    getState: (methodName: string, clientId: string, stateName: StateName) => Promise<T>;
    /**
     * Disposes the state.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The name of the state.
     * @returns {Promise<void>} - A promise that resolves when the state is disposed.
     */
    dispose: (methodName: string, clientId: string, stateName: StateName) => Promise<void>;
}

/**
 * Service for managing state schemas.
 */
declare class StateSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    /**
     * Validation for state schema
     */
    private validateShallow;
    /**
     * Registers a new state schema.
     * @param {StateName} key - The key for the schema.
     * @param {IStateSchema} value - The schema to register.
     */
    register: (key: StateName, value: IStateSchema) => void;
    /**
     * Retrieves a state schema by key.
     * @param {StateName} key - The key of the schema to retrieve.
     * @returns {IStateSchema} The retrieved schema.
     */
    get: (key: StateName) => IStateSchema;
}

declare class BusService implements IBus {
    private readonly loggerService;
    private readonly sessionValidationService;
    private _eventSourceSet;
    private _eventWildcardMap;
    private getEventSubject;
    /**
     * Subscribes to events for a specific client and source.
     * @param {string} clientId - The client ID.
     * @param {EventSource} source - The event source.
     * @param {(event: T) => void} fn - The callback function to handle the event.
     */
    subscribe: <T extends IBaseEvent>(clientId: string, source: EventSource, fn: (event: T) => void) => () => void;
    /**
     * Subscribes to a single event for a specific client and source.
     * @param {string} clientId - The client ID.
     * @param {EventSource} source - The event source.
     * @param {(event: T) => boolean} filterFn - The filter function to determine if the event should be handled.
     * @param {(event: T) => void} fn - The callback function to handle the event.
     * @returns {Subscription} The subscription object.
     */
    once: <T extends IBaseEvent>(clientId: string, source: EventSource, filterFn: (event: T) => boolean, fn: (event: T) => void) => () => void;
    /**
     * Emits an event for a specific client.
     * @param {string} clientId - The client ID.
     * @param {T} event - The event to emit.
     * @returns {Promise<void>} A promise that resolves when the event has been emitted.
     */
    emit: <T extends IBaseEvent>(clientId: string, event: T) => Promise<void>;
    /**
     * Alias to emit the execution begin event
     */
    commitExecutionBegin: (clientId: string, context: Partial<IBusEventContext>) => Promise<void>;
    /**
     * Alias to emit the execution end event
     */
    commitExecutionEnd: (clientId: string, context: Partial<IBusEventContext>) => Promise<void>;
    /**
     * Disposes of all event subscriptions for a specific client.
     * @param {string} clientId - The client ID.
     */
    dispose: (clientId: string) => void;
}

/**
 * Interface representing a meta node.
 */
interface IMetaNode {
    name: string;
    child?: IMetaNode[];
}
/**
 * Service class for managing agent meta nodes and converting them to UML format.
 */
declare class AgentMetaService {
    private readonly loggerService;
    private readonly agentSchemaService;
    private serialize;
    /**
     * Creates a meta node for the given agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {IMetaNode} The created meta node.
     */
    makeAgentNode: (agentName: AgentName, seen?: Set<string>) => IMetaNode;
    /**
     * Creates a meta node for the given agent.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {IMetaNode} The created meta node.
     */
    makeAgentNodeCommon: (agentName: AgentName, seen?: Set<string>) => IMetaNode;
    /**
     * Converts the meta nodes of the given agent to UML format.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {string} The UML representation of the agent's meta nodes.
     */
    toUML: (agentName: AgentName, withSubtree?: boolean) => string;
}

/**
 * Service for handling swarm metadata.
 */
declare class SwarmMetaService {
    private readonly loggerService;
    private readonly swarmSchemaService;
    private readonly agentMetaService;
    private serialize;
    /**
     * Creates a swarm node with the given swarm name.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {IMetaNode} The metadata node of the swarm.
     */
    makeSwarmNode: (swarmName: SwarmName) => IMetaNode;
    /**
     * Converts the swarm metadata to UML format.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {string} The UML representation of the swarm.
     */
    toUML: (swarmName: SwarmName) => string;
}

/**
 * Service for generating documentation for swarms and agents.
 * @class
 */
declare class DocService {
    private readonly loggerService;
    private readonly perfService;
    private readonly swarmValidationService;
    private readonly agentValidationService;
    private readonly swarmSchemaService;
    private readonly agentSchemaService;
    private readonly policySchemaService;
    private readonly toolSchemaService;
    private readonly storageSchemaService;
    private readonly stateSchemaService;
    private readonly agentMetaService;
    private readonly swarmMetaService;
    /**
     * Writes documentation for a swarm schema.
     * @param {ISwarmSchema} swarmSchema - The swarm schema to document.
     * @param {string} dirName - The directory to write the documentation to.
     * @returns {Promise<void>}
     */
    private writeSwarmDoc;
    /**
     * Writes documentation for an agent schema.
     * @param {IAgentSchema} agentSchema - The agent schema to document.
     * @param {string} dirName - The directory to write the documentation to.
     * @returns {Promise<void>}
     */
    private writeAgentDoc;
    /**
     * Dumps the documentation for all swarms and agents.
     * @param {string} [dirName=join(process.cwd(), "docs/chat")] - The directory to write the documentation to.
     * @returns {Promise<void>}
     */
    dumpDocs: (dirName?: string) => Promise<void>;
    /**
     * Dumps the performance data to a file.
     * @param {string} [dirName=join(process.cwd(), "docs/meta")] - The directory to write the performance data to.
     * @returns {Promise<void>}
     */
    dumpPerfomance: (dirName?: string) => Promise<void>;
    /**
     * Dumps the client performance data to a file.
     * @param {string} clientId - The session id to dump the data
     * @param {string} [dirName=join(process.cwd(), "docs/meta")] - The directory to write the performance data to.
     * @returns {Promise<void>}
     */
    dumpClientPerfomance: (clientId: string, dirName?: string) => Promise<void>;
}

/**
 * Service for managing storage connections.
 * @implements {IStorage}
 */
declare class SharedStorageConnectionService implements IStorage {
    private readonly loggerService;
    private readonly busService;
    private readonly methodContextService;
    private readonly storageSchemaService;
    private readonly embeddingSchemaService;
    /**
     * Retrieves a storage instance based on client ID and storage name.
     * @param {string} clientId - The client ID.
     * @param {string} storageName - The storage name.
     * @returns {ClientStorage} The client storage instance.
     */
    getStorage: ((storageName: StorageName) => ClientStorage<any>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientStorage<any>>;
    /**
     * Retrieves a list of storage data based on a search query and total number of items.
     * @param {string} search - The search query.
     * @param {number} total - The total number of items to retrieve.
     * @returns {Promise<IStorageData[]>} The list of storage data.
     */
    take: (search: string, total: number, score?: number) => Promise<IStorageData[]>;
    /**
     * Upserts an item in the storage.
     * @param {IStorageData} item - The item to upsert.
     * @returns {Promise<void>}
     */
    upsert: (item: IStorageData) => Promise<void>;
    /**
     * Removes an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @returns {Promise<void>}
     */
    remove: (itemId: IStorageData["id"]) => Promise<void>;
    /**
     * Retrieves an item from the storage by its ID.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
     * @returns {Promise<IStorageData>} The retrieved item.
     */
    get: (itemId: IStorageData["id"]) => Promise<IStorageData | null>;
    /**
     * Retrieves a list of items from the storage, optionally filtered by a predicate function.
     * @param {function(IStorageData): boolean} [filter] - The optional filter function.
     * @returns {Promise<IStorageData[]>} The list of items.
     */
    list: (filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>;
    /**
     * Clears all items from the storage.
     * @returns {Promise<void>}
     */
    clear: () => Promise<void>;
}

/**
 * Service for managing shared state connections.
 * @template T - The type of state data.
 * @implements {IState<T>}
 */
declare class SharedStateConnectionService<T extends IStateData = IStateData> implements IState<T> {
    private readonly loggerService;
    private readonly busService;
    private readonly methodContextService;
    private readonly stateSchemaService;
    /**
     * Memoized function to get a shared state reference.
     * @param {string} clientId - The client ID.
     * @param {StateName} stateName - The state name.
     * @returns {ClientState} The client state.
     */
    getStateRef: ((stateName: StateName) => ClientState<any>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientState<any>>;
    /**
     * Sets the state.
     * @param {function(T): Promise<T>} dispatchFn - The function to dispatch the new state.
     * @returns {Promise<T>} The new state.
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;
    /**
     * Set the state to initial value
     * @returns {Promise<T>} The new state.
     */
    clearState: () => Promise<T>;
    /**
     * Gets the state.
     * @returns {Promise<T>} The current state.
     */
    getState: () => Promise<T>;
}

interface ISharedStateConnectionService extends SharedStateConnectionService {
}
type InternalKeys$2 = keyof {
    getStateRef: never;
    getSharedStateRef: never;
};
type TSharedStateConnectionService = {
    [key in Exclude<keyof ISharedStateConnectionService, InternalKeys$2>]: unknown;
};
declare class SharedStatePublicService<T extends IStateData = IStateData> implements TSharedStateConnectionService {
    private readonly loggerService;
    private readonly sharedStateConnectionService;
    /**
     * Sets the state using the provided dispatch function.
     * @param {function(T): Promise<T>} dispatchFn - The function to dispatch the state change.
     * @param {StateName} stateName - The name of the state.
     * @returns {Promise<T>} - The updated state.
     */
    setState: (dispatchFn: (prevState: T) => Promise<T>, methodName: string, stateName: StateName) => Promise<T>;
    /**
     * Set the state to initial value
     * @param {StateName} stateName - The name of the state.
     * @returns {Promise<T>} - The initial state.
     */
    clearState: (methodName: string, stateName: StateName) => Promise<T>;
    /**
     * Gets the current state.
     * @param {StateName} stateName - The name of the state.
     * @returns {Promise<T>} - The current state.
     */
    getState: (methodName: string, stateName: StateName) => Promise<T>;
}

interface ISharedStorageConnectionService extends SharedStorageConnectionService {
}
type InternalKeys$1 = keyof {
    getStorage: never;
    getSharedStorage: never;
};
type TSharedStorageConnectionService = {
    [key in Exclude<keyof ISharedStorageConnectionService, InternalKeys$1>]: unknown;
};
/**
 * Service for managing public storage interactions.
 */
declare class SharedStoragePublicService implements TSharedStorageConnectionService {
    private readonly loggerService;
    private readonly sharedStorageConnectionService;
    /**
     * Retrieves a list of storage data based on a search query and total number of items.
     * @param {string} search - The search query.
     * @param {number} total - The total number of items to retrieve.
     * @returns {Promise<IStorageData[]>} The list of storage data.
     */
    take: (search: string, total: number, methodName: string, storageName: StorageName, score?: number) => Promise<IStorageData[]>;
    /**
     * Upserts an item in the storage.
     * @param {IStorageData} item - The item to upsert.
     * @returns {Promise<void>}
     */
    upsert: (item: IStorageData, methodName: string, storageName: StorageName) => Promise<void>;
    /**
     * Removes an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @returns {Promise<void>}
     */
    remove: (itemId: IStorageData["id"], methodName: string, storageName: StorageName) => Promise<void>;
    /**
     * Retrieves an item from the storage by its ID.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
     * @returns {Promise<IStorageData>} The retrieved item.
     */
    get: (itemId: IStorageData["id"], methodName: string, storageName: StorageName) => Promise<IStorageData | null>;
    /**
     * Retrieves a list of items from the storage, optionally filtered by a predicate function.
     * @param {function(IStorageData): boolean} [filter] - The optional filter function.
     * @returns {Promise<IStorageData[]>} The list of items.
     */
    list: (methodName: string, storageName: StorageName, filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>;
    /**
     * Clears all items from the storage.
     * @returns {Promise<void>}
     */
    clear: (methodName: string, storageName: StorageName) => Promise<void>;
}

/**
 * Service to manage memory schema for different sessions.
 */
declare class MemorySchemaService {
    private readonly loggerService;
    private memoryMap;
    /**
     * Writes a value to the memory map for a given client ID.
     *
     * @template T - The type of the value to be written.
     * @param {string} clientId - The ID of the client.
     * @param {T} value - The value to be written.
     */
    writeValue: <T extends object = object>(clientId: string, value: T) => T;
    /**
     * Reads a value from the memory map for a given client ID.
     *
     * @template T - The type of the value to be read.
     * @param {string} clientId - The ID of the client.
     * @returns {T} - The value associated with the client ID.
     */
    readValue: <T extends object = object>(clientId: string) => T;
    /**
     * Disposes the memory map entry for a given client ID.
     *
     * @param {string} clientId - The ID of the client.
     */
    dispose: (clientId: string) => void;
}

/**
 * Interface representing a performance record.
 */
interface IPerformanceRecord {
    /**
     * The ID of current process
     */
    processId: string;
    /**
     * Array of client performance records.
     */
    clients: IClientPerfomanceRecord[];
    /**
     * Total execution count.
     */
    totalExecutionCount: number;
    /**
     * Total response time as a string.
     */
    totalResponseTime: string;
    /**
     * Average response time as a string.
     */
    averageResponseTime: string;
    /**
     * Days since 01/01/1970 in London.
     */
    momentStamp: number;
    /**
     * Seconds since 00:00 of the momentStamp.
     */
    timeStamp: number;
    /**
     * Current date in UTC format
     */
    date: string;
}
/**
 * Interface representing a client performance record.
 */
interface IClientPerfomanceRecord {
    /**
     * Client ID.
     */
    clientId: string;
    /**
     * The memory of client session
     */
    sessionMemory: Record<string, unknown>;
    /**
     * The state of client session
     */
    sessionState: Record<string, unknown>;
    /**
     * Execution count.
     */
    executionCount: number;
    /**
     * Total execution input.
     */
    executionInputTotal: number;
    /**
     * Total execution output.
     */
    executionOutputTotal: number;
    /**
     * Average execution input.
     */
    executionInputAverage: number;
    /**
     * Average execution output.
     */
    executionOutputAverage: number;
    /**
     * Total execution time as a string.
     */
    executionTimeTotal: string;
    /**
     * Average execution time as a string.
     */
    executionTimeAverage: string;
}

/**
 * Performance Service to track and log execution times, input lengths, and output lengths
 * for different client sessions.
 */
declare class PerfService {
    private readonly loggerService;
    private readonly sessionValidationService;
    private readonly memorySchemaService;
    private readonly swarmValidationService;
    private readonly agentValidationService;
    private readonly statePublicService;
    private readonly swarmPublicService;
    private readonly policyPublicService;
    private readonly stateConnectionService;
    private executionScheduleMap;
    private executionOutputLenMap;
    private executionInputLenMap;
    private executionCountMap;
    private executionTimeMap;
    private totalResponseTime;
    private totalRequestCount;
    /**
     * Computes the state of the client by aggregating the states of all agents in the client's swarm.
     * @param {string} clientId - The client ID.
     * @returns {Promise<Record<string, unknown>>} A promise that resolves to an object containing the aggregated state of the client.
     */
    private computeClientState;
    /**
     * Gets the number of active session executions for a given client.
     * @param {string} clientId - The client ID.
     * @returns {number} The number of active session executions.
     */
    getActiveSessionExecutionCount: (clientId: string) => number;
    /**
     * Gets the total execution time for a given client's sessions.
     * @param {string} clientId - The client ID.
     * @returns {number} The total execution time in milliseconds.
     */
    getActiveSessionExecutionTotalTime: (clientId: string) => number;
    /**
     * Gets the average execution time for a given client's sessions.
     * @param {string} clientId - The client ID.
     * @returns {number} The average execution time in milliseconds.
     */
    getActiveSessionExecutionAverageTime: (clientId: string) => number;
    /**
     * Gets the average input length for active sessions of a given client.
     * @param {string} clientId - The client ID.
     * @returns {number} The average input length.
     */
    getActiveSessionAverageInputLength: (clientId: string) => number;
    /**
     * Gets the average output length for active sessions of a given client.
     * @param {string} clientId - The client ID.
     * @returns {number} The average output length.
     */
    getActiveSessionAverageOutputLength: (clientId: string) => number;
    /**
     * Gets the total input length for active sessions of a given client.
     * @param {string} clientId - The client ID.
     * @returns {number} The total input length.
     */
    getActiveSessionTotalInputLength: (clientId: string) => number;
    /**
     * Gets the total output length for active sessions of a given client.
     * @param {string} clientId - The client ID.
     * @returns {number} The total output length.
     */
    getActiveSessionTotalOutputLength: (clientId: string) => number;
    /**
     * Gets the list of active sessions.
     * @returns {string[]} The list of active sessions.
     */
    getActiveSessions: () => string[];
    /**
     * Gets the average response time for all requests.
     * @returns {number} The average response time.
     */
    getAverageResponseTime: () => number;
    /**
     * Gets the total number of executions.
     * @returns {number} The total number of executions.
     */
    getTotalExecutionCount: () => number;
    /**
     * Gets the total response time for all requests.
     * @returns {number} The total response time.
     */
    getTotalResponseTime: () => number;
    /**
     * Starts an execution for a given client.
     * @param {string} executionId - The execution ID.
     * @param {string} clientId - The client ID.
     * @param {number} inputLen - The input length.
     */
    startExecution: (executionId: string, clientId: string, inputLen: number) => void;
    /**
     * Ends an execution for a given client.
     * @param {string} executionId - The execution ID.
     * @param {string} clientId - The client ID.
     * @param {number} outputLen - The output length.
     * @returns {boolean} True if the execution ended successfully (all required data was found), false otherwise.
     */
    endExecution: (executionId: string, clientId: string, outputLen: number) => boolean;
    /**
     * Convert performance measures of the client for serialization
     * @param {string} clientId - The client ID.
     */
    toClientRecord: (clientId: string) => Promise<IClientPerfomanceRecord>;
    /**
     * Convert performance measures of all clients for serialization.
     * @returns {Promise<IPerformanceRecord>} An object containing performance measures of all clients,
     *                   total execution count, total response time, and average response time.
     */
    toRecord: () => Promise<IPerformanceRecord>;
    /**
     * Disposes of all data related to a given client.
     * @param {string} clientId - The client ID.
     */
    dispose: (clientId: string) => void;
}

/**
 * Service for managing policy schemas.
 */
declare class PolicySchemaService {
    readonly loggerService: LoggerService;
    private registry;
    /**
     * Validation for policy schema
     */
    private validateShallow;
    /**
     * Registers a new policy schema.
     * @param {PolicyName} key - The name of the policy.
     * @param {IPolicySchema} value - The schema of the policy.
     */
    register: (key: PolicyName, value: IPolicySchema) => void;
    /**
     * Retrieves an policy schema by name.
     * @param {PolicyName} key - The name of the policy.
     * @returns {IPolicySchema} The schema of the policy.
     */
    get: (key: PolicyName) => IPolicySchema;
}

/**
 * Service for validating policys within the agent-swarm.
 */
declare class PolicyValidationService {
    private readonly loggerService;
    private _policyMap;
    /**
     * Adds a new policy to the validation service.
     * @param {PolicyName} policyName - The name of the policy to add.
     * @param {IPolicySchema} policySchema - The schema of the policy to add.
     * @throws Will throw an error if the policy already exists.
     */
    addPolicy: (policyName: PolicyName, policySchema: IPolicySchema) => void;
    /**
     * Validates if a policy exists in the validation service.
     * @param {PolicyName} policyName - The name of the policy to validate.
     * @param {string} source - The source of the validation request.
     * @throws Will throw an error if the policy is not found.
     */
    validate: (policyName: PolicyName, source: string) => void;
}

declare const BAN_NEED_FETCH: unique symbol;
/**
 * Class representing a client policy for managing bans, input/output validation, and client restrictions.
 * @implements {IPolicy}
 */
declare class ClientPolicy implements IPolicy {
    readonly params: IPolicyParams;
    /**
     * Set of banned client IDs or a symbol indicating the ban list needs to be fetched.
     * Initialized as BAN_NEED_FETCH and lazily populated on first use.
     */
    _banSet: Set<SessionId> | typeof BAN_NEED_FETCH;
    /**
     * Creates an instance of ClientPolicy.
     * Invokes the onInit callback if provided.
     * @param {IPolicyParams} params - The parameters for initializing the policy.
     */
    constructor(params: IPolicyParams);
    /**
     * Checks if a client is banned for a specific swarm.
     * Lazily fetches the ban list on the first call if not already loaded.
     * @param {SessionId} clientId - The ID of the client to check.
     * @param {SwarmName} swarmName - The name of the swarm to check against.
     * @returns {Promise<boolean>} True if the client is banned, false otherwise.
     */
    hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Retrieves the ban message for a client.
     * Uses a custom getBanMessage function if provided, otherwise falls back to the default ban message.
     * @param {SessionId} clientId - The ID of the client to get the ban message for.
     * @param {SwarmName} swarmName - The name of the swarm to check against.
     * @returns {Promise<string>} The ban message for the client.
     */
    getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;
    /**
     * Validates an incoming message from a client.
     * Checks if the client is banned and applies the custom validation function if provided.
     * Automatically bans the client if validation fails and autoBan is enabled.
     * @param {string} incoming - The incoming message to validate.
     * @param {SessionId} clientId - The ID of the client sending the message.
     * @param {SwarmName} swarmName - The name of the swarm to validate against.
     * @returns {Promise<boolean>} True if the input is valid and the client is not banned, false otherwise.
     */
    validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Validates an outgoing message to a client.
     * Checks if the client is banned and applies the custom validation function if provided.
     * Automatically bans the client if validation fails and autoBan is enabled.
     * @param {string} outgoing - The outgoing message to validate.
     * @param {SessionId} clientId - The ID of the client receiving the message.
     * @param {SwarmName} swarmName - The name of the swarm to validate against.
     * @returns {Promise<boolean>} True if the output is valid and the client is not banned, false otherwise.
     */
    validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Bans a client, adding them to the ban set and persisting the change if setBannedClients is provided.
     * Emits a ban event and invokes the onBanClient callback if defined.
     * @param {SessionId} clientId - The ID of the client to ban.
     * @param {SwarmName} swarmName - The name of the swarm to ban the client from.
     * @returns {Promise<void>}
     */
    banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
    /**
     * Unbans a client, removing them from the ban set and persisting the change if setBannedClients is provided.
     * Emits an unban event and invokes the onUnbanClient callback if defined.
     * @param {SessionId} clientId - The ID of the client to unban.
     * @param {SwarmName} swarmName - The name of the swarm to unban the client from.
     * @returns {Promise<void>}
     */
    unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
}

/**
 * Service for managing policy connections.
 * @implements {IPolicy}
 */
declare class PolicyConnectionService implements IPolicy {
    private readonly loggerService;
    private readonly busService;
    private readonly methodContextService;
    private readonly policySchemaService;
    /**
     * Retrieves a policy based on the policy name.
     * @param {PolicyName} policyName - The name of the policy.
     * @returns {ClientPolicy} The client policy.
     */
    getPolicy: ((policyName: PolicyName) => ClientPolicy) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientPolicy>;
    /**
     * Check if got ban flag
     * @param {SessionId} clientId - The ID of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {Promise<boolean>}
     */
    hasBan: (clientId: SessionId, swarmName: SwarmName) => Promise<boolean>;
    /**
     * Retrieves the ban message for a client in a swarm.
     * @param {SessionId} clientId - The ID of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {Promise<string>} The ban message.
     */
    getBanMessage: (clientId: SessionId, swarmName: SwarmName) => Promise<string>;
    /**
     * Validates the input for a client in a swarm.
     * @param {string} incoming - The incoming input.
     * @param {SessionId} clientId - The ID of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {Promise<boolean>} Whether the input is valid.
     */
    validateInput: (incoming: string, clientId: SessionId, swarmName: SwarmName) => Promise<boolean>;
    /**
     * Validates the output for a client in a swarm.
     * @param {string} outgoing - The outgoing output.
     * @param {SessionId} clientId - The ID of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {Promise<boolean>} Whether the output is valid.
     */
    validateOutput: (outgoing: string, clientId: SessionId, swarmName: SwarmName) => Promise<boolean>;
    /**
     * Bans a client from a swarm.
     * @param {SessionId} clientId - The ID of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {Promise<void>}
     */
    banClient: (clientId: SessionId, swarmName: SwarmName) => Promise<void>;
    /**
     * Unbans a client from a swarm.
     * @param {SessionId} clientId - The ID of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @returns {Promise<void>}
     */
    unbanClient: (clientId: SessionId, swarmName: SwarmName) => Promise<void>;
}

interface IPolicyConnectionService extends PolicyConnectionService {
}
type InternalKeys = keyof {
    getPolicy: never;
};
type TPolicyConnectionService = {
    [key in Exclude<keyof IPolicyConnectionService, InternalKeys>]: unknown;
};
/**
 * Service for handling public policy operations.
 */
declare class PolicyPublicService implements TPolicyConnectionService {
    private readonly loggerService;
    private readonly policyConnectionService;
    /**
     * Check if has ban message
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {string} methodName - The name of the method.
     * @param {string} clientId - The ID of the client.
     * @param {PolicyName} policyName - The name of the policy.
     * @returns {Promise<boolean>}
     */
    hasBan: (swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<boolean>;
    /**
     * Retrieves the ban message for a client in a specific swarm.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {string} methodName - The name of the method.
     * @param {string} clientId - The ID of the client.
     * @param {PolicyName} policyName - The name of the policy.
     * @returns {Promise<string>} The ban message.
     */
    getBanMessage: (swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<string>;
    /**
     * Validates the input for a specific policy.
     * @param {string} incoming - The incoming data to validate.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {string} methodName - The name of the method.
     * @param {string} clientId - The ID of the client.
     * @param {PolicyName} policyName - The name of the policy.
     * @returns {Promise<boolean>} The result of the validation.
     */
    validateInput: (incoming: string, swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<boolean>;
    /**
     * Validates the output for a specific policy.
     * @param {string} outgoing - The outgoing data to validate.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {string} methodName - The name of the method.
     * @param {string} clientId - The ID of the client.
     * @param {PolicyName} policyName - The name of the policy.
     * @returns {Promise<boolean>} The result of the validation.
     */
    validateOutput: (outgoing: string, swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<boolean>;
    /**
     * Bans a client from a specific swarm.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {string} methodName - The name of the method.
     * @param {string} clientId - The ID of the client.
     * @param {PolicyName} policyName - The name of the policy.
     * @returns {Promise<void>}
     */
    banClient: (swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<void>;
    /**
     * Unbans a client from a specific swarm.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {string} methodName - The name of the method.
     * @param {string} clientId - The ID of the client.
     * @param {PolicyName} policyName - The name of the policy.
     * @returns {Promise<void>}
     */
    unbanClient: (swarmName: SwarmName, methodName: string, clientId: string, policyName: PolicyName) => Promise<void>;
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
    executionContextService: {
        readonly context: IExecutionContext;
    };
    docService: DocService;
    busService: BusService;
    perfService: PerfService;
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
 * Adds a new agent to the agent registry. The swarm takes only those agents which was registered
 *
 * @param {IAgentSchema} agentSchema - The schema of the agent to be added.
 * @returns {string} The name of the added agent.
 */
declare const addAgent: (agentSchema: IAgentSchema) => string;

/**
 * Adds a completion engine for agents. Agents could use different models and
 * framewords for completion like: mock, gpt4all, ollama, openai
 *
 * @param {ICompletionSchema} completionSchema - The completion schema to be added.
 * @returns {string} The name of the completion that was added.
 */
declare const addCompletion: (completionSchema: ICompletionSchema) => string;

/**
 * Adds a new swarm to the system. The swarm is a root for starting client session
 *
 * @param {ISwarmSchema} swarmSchema - The schema of the swarm to be added.
 * @returns {string} The name of the added swarm.
 */
declare const addSwarm: (swarmSchema: ISwarmSchema) => string;

/**
 * Adds a new tool for agents in a swarm. Tool should be registered in `addAgent`
 * declaration
 *
 * @param {IAgentTool} toolSchema - The schema of the tool to be added.
 * @returns {string} The name of the tool that was added.
 */
declare const addTool: <T extends any = Record<string, ToolValue>>(storageSchema: IAgentTool<T>) => string;

/**
 * Adds a new state to the state registry. The swarm takes only those states which was registered
 *
 * @param {IStateSchema} stateSchema - The schema of the state to be added.
 * @returns {string} The name of the added state.
 */
declare const addState: <T extends unknown = any>(storageSchema: IStateSchema<T>) => string;

/**
 * Adds a new embedding to the embedding registry. The swarm takes only those embeddings which was registered
 *
 * @param {IEmbeddingSchema} embeddingSchema - The schema of the embedding to be added.
 * @returns {string} The name of the added embedding.
 */
declare const addEmbedding: (embeddingSchema: IEmbeddingSchema) => string;

/**
 * Adds a new storage to the storage registry. The swarm takes only those storages which was registered
 *
 * @param {IStorageSchema} storageSchema - The schema of the storage to be added.
 * @returns {string} The name of the added storage.
 */
declare const addStorage: <T extends IStorageData = IStorageData>(storageSchema: IStorageSchema<T>) => string;

/**
 * Adds a new policy for agents in a swarm. Policy should be registered in `addPolicy`
 * declaration
 *
 * @param {IPolicySchema} policySchema - The schema of the policy to be added.
 * @returns {string} The name of the policy that was added.
 */
declare const addPolicy: (policySchema: IPolicySchema) => string;

/**
 * Commits the tool output to the active agent in a swarm session
 *
 * @param {string} content - The content to be committed.
 * @param {string} clientId - The client ID associated with the session.
 * @param {AgentName} agentName - The name of the agent committing the output.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
declare const commitToolOutput: (toolId: string, content: string, clientId: string, agentName: string) => Promise<void>;

/**
 * Commits a system message to the active agent in the swarm.
 *
 * @param {string} content - The content of the system message.
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitSystemMessage: (content: string, clientId: string, agentName: string) => Promise<void>;

/**
 * Commits flush of agent history
 *
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitFlush: (clientId: string, agentName: string) => Promise<void>;

/**
 * Commits a user message to the active agent history in as swarm without answer.
 *
 * @param {string} content - The content of the message.
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitUserMessage: (content: string, clientId: string, agentName: string) => Promise<void>;

/**
 * Commits the tool output to the active agent in a swarm session without checking active agent
 *
 * @param {string} content - The content to be committed.
 * @param {string} clientId - The client ID associated with the session.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
declare const commitToolOutputForce: (toolId: string, content: string, clientId: string) => Promise<void>;

/**
 * Commits a system message to the active agent in as swarm without checking active agent.
 *
 * @param {string} content - The content of the system message.
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitSystemMessageForce: (content: string, clientId: string) => Promise<void>;

/**
 * Commits flush of agent history without active agent check
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitFlushForce: (clientId: string) => Promise<void>;

/**
 * Commits a user message to the active agent history in as swarm without answer and checking active agent
 *
 * @param {string} content - The content of the message.
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitUserMessageForce: (content: string, clientId: string) => Promise<void>;

/**
 * Commits an assistant message to the active agent in the swarm.
 *
 * @param {string} content - The content of the assistant message.
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitAssistantMessage: (content: string, clientId: string, agentName: string) => Promise<void>;

/**
 * Commits an assistant message to the active agent in as swarm without checking active agent.
 *
 * @param {string} content - The content of the assistant message.
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitAssistantMessageForce: (content: string, clientId: string) => Promise<void>;

/**
 * Cancel the await of output by emit of empty string
 *
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the output is canceled
 */
declare const cancelOutput: (clientId: string, agentName: string) => Promise<void>;

/**
 * Cancel the await of output by emit of empty string without checking active agent
 *
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the output is canceled
 */
declare const cancelOutputForce: (clientId: string) => Promise<void>;

/**
 * Prevent the next tool from being executed
 *
 * @param {string} clientId - The ID of the client.
 * @param {string} agentName - The name of the agent.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitStopTools: (clientId: string, agentName: string) => Promise<void>;

/**
 * Prevent the next tool from being executed without active agent check
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<void>} - A promise that resolves when the message is committed.
 */
declare const commitStopToolsForce: (clientId: string) => Promise<void>;

/**
 * Emits a string constant as the model output without executing incoming message and checking active agent
 * Works only for `makeConnection`
 *
 * @param {string} content - The content to be emitted.
 * @param {string} clientId - The client ID of the session.
 * @param {AgentName} agentName - The name of the agent to emit the content to.
 * @throws Will throw an error if the session mode is not "makeConnection".
 * @returns {Promise<void>} A promise that resolves when the content is emitted.
 */
declare const emitForce: (content: string, clientId: string) => Promise<void>;

/**
 * Send the message to the active agent in the swarm content like it income from client side
 * Should be used to review tool output and initiate conversation from the model side to client
 *
 * Will execute even if the agent is inactive
 *
 * @param {string} content - The content to be executed.
 * @param {string} clientId - The ID of the client requesting execution.
 * @returns {Promise<void>} - A promise that resolves when the execution is complete.
 */
declare const executeForce: (content: string, clientId: string) => Promise<string>;

/**
 * Interface for the parameters of the makeAutoDispose function.
 */
interface IMakeDisposeParams {
    /**
     * Timeout in seconds before auto-dispose is triggered.
     */
    timeoutSeconds: number;
    /**
     * Callback when session is closed
     */
    onDestroy?: (clientId: string, swarmName: SwarmName) => void;
}
/**
 * Creates an auto-dispose mechanism for a client in a swarm.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @param {Partial<IMakeDisposeParams>} [params={}] - Optional parameters for auto-dispose.
 * @returns {Object} An object with tick and stop methods to control the auto-dispose.
 */
declare const makeAutoDispose: (clientId: string, swarmName: string, args_2?: Partial<IMakeDisposeParams>) => {
    /**
     * Signals that the client is active, resetting the auto-dispose timer.
     */
    tick(): void;
    /**
     * Stops the auto-dispose mechanism.
     */
    destroy(): void;
};

/**
 * Send the message to the active agent in the swarm content like it income from client side
 * Should be used to review tool output and initiate conversation from the model side to client
 *
 * @param {string} content - The content to be executed.
 * @param {string} clientId - The ID of the client requesting execution.
 * @param {AgentName} agentName - The name of the agent executing the command.
 * @returns {Promise<void>} - A promise that resolves when the execution is complete.
 */
declare const execute: (content: string, clientId: string, agentName: string) => Promise<string>;

/**
 * Emits a string constant as the model output without executing incoming message
 * Works only for `makeConnection`
 *
 * @param {string} content - The content to be emitted.
 * @param {string} clientId - The client ID of the session.
 * @param {AgentName} agentName - The name of the agent to emit the content to.
 * @throws Will throw an error if the session mode is not "makeConnection".
 * @returns {Promise<void>} A promise that resolves when the content is emitted.
 */
declare const emit: (content: string, clientId: string, agentName: string) => Promise<void>;

/**
 * Complete the message stateless without append to the chat history
 * Use to prevent model from history overflow while handling storage output
 *
 * @param {string} content - The content to be runned.
 * @param {string} clientId - The ID of the client requesting run.
 * @param {AgentName} agentName - The name of the agent running the command.
 * @returns {Promise<string>} - A promise that resolves the run result
 */
declare const runStateless: (content: string, clientId: string, agentName: string) => Promise<string>;

/**
 * Complete the message stateless without append to the chat history
 * Use to prevent model from history overflow while handling storage output
 *
 * Will run even if the agent is inactive
 *
 * @param {string} content - The content to be runned.
 * @param {string} clientId - The ID of the client requesting run.
 * @returns {Promise<string>} - A promise that resolves the run result
 */
declare const runStatelessForce: (content: string, clientId: string) => Promise<string>;

type SendMessageFn = (outgoing: string) => Promise<void>;
/**
 * A connection factory for a client to a swarm and returns a function to send messages.
 *
 * @param {ReceiveMessageFn} connector - The function to receive messages.
 * @param {string} clientId - The unique identifier of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {SendMessageFn} - A function to send messages to the swarm.
 */
declare const makeConnection: {
    (connector: ReceiveMessageFn, clientId: string, swarmName: SwarmName): SendMessageFn;
    /**
     * A scheduled connection factory for a client to a swarm and returns a function to send messages.
     *
     * @param {ReceiveMessageFn} connector - The function to receive messages.
     * @param {string} clientId - The unique identifier of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {Partial<IMakeConnectionConfig>} [config] - The configuration for scheduling.
     * @returns {SendMessageFn} - A function to send scheduled messages to the swarm.
     */
    scheduled: (connector: ReceiveMessageFn, clientId: string, swarmName: string, args_3?: Partial<IMakeConnectionConfig>) => (content: string) => Promise<void>;
    /**
     * A rate-limited connection factory for a client to a swarm and returns a function to send messages.
     *
     * @param {ReceiveMessageFn} connector - The function to receive messages.
     * @param {string} clientId - The unique identifier of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {Partial<IMakeConnectionConfig>} [config] - The configuration for rate limiting.
     * @param {number} [config.delay=RATE_DELAY] - The delay in milliseconds for rate limiting messages.
     * @returns {SendMessageFn} - A function to send rate-limited messages to the swarm.
     */
    rate: (connector: ReceiveMessageFn, clientId: string, swarmName: string, args_3?: Partial<IMakeConnectionConfig>) => (content: string) => Promise<void | "">;
};
/**
 * Configuration for scheduling messages.
 *
 * @interface IMakeConnectionConfig
 * @property {number} [delay] - The delay in milliseconds for scheduling messages.
 */
interface IMakeConnectionConfig {
    delay?: number;
}

/**
 * The complete function will create a swarm, execute single command and dispose it
 * Best for developer needs like troubleshooting tool execution
 *
 * @param {string} content - The content to process.
 * @param {string} clientId - The client ID.
 * @param {SwarmName} swarmName - The swarm name.
 * @returns {Promise<string>} The result of the complete function.
 */
declare const complete: (content: string, clientId: string, swarmName: string) => Promise<string>;

type TComplete = (content: string) => Promise<string>;
/**
 * Creates a session for the given client and swarm.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {Object} An object containing the session methods.
 * @returns {TComplete} complete - A function to complete the session with content.
 * @returns {Function} dispose - A function to dispose of the session.
 */
declare const session: {
    (clientId: string, swarmName: SwarmName): {
        /**
         * Completes the session with the given content.
         *
         * @param {string} content - The content to complete the session with.
         * @returns {Promise<string>} A promise that resolves with the result of the session execution.
         */
        complete: TComplete;
        /**
         * Disposes of the session.
         *
         * @returns {Promise<void>} A promise that resolves when the session is disposed.
         */
        dispose: () => Promise<void>;
    };
    /**
     * Creates a scheduled session for the given client and swarm.
     *
     * @param {string} clientId - The ID of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {Partial<ISessionConfig>} [config] - The configuration for the scheduled session.
     * @param {number} [config.delay] - The delay for the scheduled session.
     * @returns {Object} An object containing the scheduled session methods.
     * @returns {TComplete} complete - A function to complete the session with content.
     * @returns {Function} dispose - A function to dispose of the session.
     */
    scheduled(clientId: string, swarmName: SwarmName, { delay }?: Partial<ISessionConfig>): {
        /**
         * Completes the scheduled session with the given content.
         *
         * @param {string} content - The content to complete the session with.
         * @returns {Promise<string>} A promise that resolves with the result of the session execution.
         */
        complete(content: string): Promise<string>;
        /**
         * Disposes of the scheduled session.
         *
         * @returns {Promise<void>} A promise that resolves when the session is disposed.
         */
        dispose(): Promise<void>;
    };
    /**
     * A rate-limited connection factory for a client to a swarm and returns a function to send messages.
     *
     * @param {string} clientId - The unique identifier of the client.
     * @param {SwarmName} swarmName - The name of the swarm.
     * @param {Partial<ISessionConfig>} [config] - The configuration for rate limiting.
     * @param {number} [config.delay=SCHEDULED_DELAY] - The delay in milliseconds for rate limiting messages.
     */
    rate(clientId: string, swarmName: SwarmName, { delay }?: Partial<ISessionConfig>): {
        /**
         * Completes the scheduled session with the given content.
         *
         * @param {string} content - The content to complete the session with.
         * @returns {Promise<string>} A promise that resolves with the result of the session execution.
         */
        complete(content: string): Promise<string>;
        /**
         * Disposes of the scheduled session.
         *
         * @returns {Promise<void>} A promise that resolves when the session is disposed.
         */
        dispose(): Promise<void>;
    };
};
/**
 * Configuration options for a scheduled session.
 *
 * @interface ISessionConfig
 * @property {number} [delay] - The delay for the scheduled session in milliseconds.
 */
interface ISessionConfig {
    delay?: number;
}

/**
 * Disposes the session for a given client with all related swarms and agents.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {Promise<void>} A promise that resolves when the connection is disposed.
 */
declare const disposeConnection: (clientId: string, swarmName: string, methodName?: any) => Promise<void>;

/**
 * Retrieves the agent name for a given client ID.
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<string>} The name of the agent.
 * @throws Will throw an error if the client ID is invalid or if the swarm validation fails.
 */
declare const getAgentName: (clientId: string) => Promise<string>;

/**
 * Retrieves the history prepared for a specific agent with resque algorithm tweaks
 *
 * @param {string} clientId - The ID of the client.
 * @param {AgentName} agentName - The name of the agent.
 * @returns {Promise<Array>} - A promise that resolves to an array containing the agent's history.
 */
declare const getAgentHistory: (clientId: string, agentName: string) => Promise<IModelMessage[]>;

/**
 * Return the session mode (`"session" | "makeConnection" | "complete"`) for clientId
 *
 * @param {string} clientId - The client ID of the session.
 */
declare const getSessionMode: (clientId: string) => Promise<SessionMode>;

/**
 * Represents the session context.
 *
 * @interface ISessionContext
 * @property {string | null} clientId - The client id, or null if not available.
 * @property {IMethodContext | null} methodContext - The method context, or null if not available.
 * @property {IExecutionContext | null} executionContext - The execution context, or null if not available.
 */
interface ISessionContext {
    clientId: string | null;
    processId: string;
    methodContext: IMethodContext | null;
    executionContext: IExecutionContext | null;
}
/**
 * Retrieves the session context for a given client ID.
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<ISessionContext>} A promise that resolves to the session context.
 */
declare const getSessionContext: () => Promise<ISessionContext>;

/**
 * Retrieves the last message sent by the user from the client's message history.
 *
 * @param {string} clientId - The ID of the client whose message history is being retrieved.
 * @returns {Promise<string | null>} - The content of the last user message, or null if no user message is found.
 */
declare const getLastUserMessage: (clientId: string) => Promise<string>;

/**
 * Retrieves the user history for a given client ID.
 *
 * @param {string} clientId - The ID of the client whose history is to be retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array of history objects filtered by user role.
 */
declare const getUserHistory: (clientId: string) => Promise<IModelMessage[]>;

/**
 * Retrieves the assistant's history for a given client.
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<Array>} - A promise that resolves to an array of history objects where the role is "assistant".
 */
declare const getAssistantHistory: (clientId: string) => Promise<IModelMessage[]>;

/**
 * Retrieves the last message sent by the assistant from the client's message history.
 *
 * @param {string} clientId - The ID of the client whose message history is being retrieved.
 * @returns {Promise<string | null>} - The content of the last assistant message, or null if no user message is found.
 */
declare const getLastAssistantMessage: (clientId: string) => Promise<string>;

/**
 * Retrieves the last message sent by the system from the client's message history.
 *
 * @param {string} clientId - The ID of the client whose message history is being retrieved.
 * @returns {Promise<string | null>} - The content of the last system message, or null if no user message is found.
 */
declare const getLastSystemMessage: (clientId: string) => Promise<string>;

/**
 * Retrieves the raw history as it is for a given client ID without any modifications.
 *
 * @param {string} clientId - The ID of the client whose history is to be retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array containing the raw history.
 */
declare const getRawHistory: (clientId: string, methodName?: any) => Promise<IModelMessage[]>;

/**
 * Emits an event to the swarm bus service.
 *
 * @template T - The type of the payload.
 * @param {string} clientId - The ID of the client emitting the event.
 * @param {T} payload - The payload of the event.
 * @returns {boolean} - Returns true if the event was successfully emitted.
 */
declare const event: <T extends unknown = any>(clientId: string, topicName: string, payload: T) => Promise<void>;

/**
 * Listens for an event on the swarm bus service and executes a callback function when the event is received.
 *
 * @template T - The type of the data payload.
 * @param {string} clientId - The ID of the client to listen for events from.
 * @param {(data: T) => void} fn - The callback function to execute when the event is received. The data payload is passed as an argument to this function.
 */
declare const listenEvent: <T extends unknown = any>(clientId: string, topicName: string, fn: (data: T) => void) => () => void;

/**
 * Listens for an event on the swarm bus service and executes a callback function when the event is received.
 *
 * @template T - The type of the data payload.
 * @param {string} clientId - The ID of the client to listen for events from.
 * @param {(data: T) => void} fn - The callback function to execute when the event is received. The data payload is passed as an argument to this function.
 */
declare const listenEventOnce: <T extends unknown = any>(clientId: string, topicName: string, filterFn: (event: T) => boolean, fn: (data: T) => void) => () => void;

/**
 * Changes the agent for a given client session in swarm.
 * @async
 * @function
 * @param {AgentName} agentName - The name of the agent.
 * @param {string} clientId - The client ID.
 * @returns {Promise<void>} - A promise that resolves when the agent is changed.
 */
declare const changeToAgent: (agentName: string, clientId: string) => Promise<void>;

/**
 * Navigates back to the previous or default agent
 * @async
 * @function
 * @param {string} clientId - The client ID.
 * @returns {Promise<void>} - A promise that resolves when the agent is changed.
 */
declare const changeToPrevAgent: (clientId: string) => Promise<void>;

/**
 * Navigates back to the default agent
 * @async
 * @function
 * @param {string} clientId - The client ID.
 * @returns {Promise<void>} - A promise that resolves when the agent is changed.
 */
declare const changeToDefaultAgent: (clientId: string) => Promise<void>;

/**
 * Hook to subscribe to agent events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {function} fn - The callback function to handle the event.
 */
declare const listenAgentEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to history events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
declare const listenHistoryEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to session events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to session events for.
 * @param {function} fn - The callback function to handle the session events.
 */
declare const listenSessionEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to state events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to.
 * @param {function} fn - The callback function to handle the event.
 */
declare const listenStateEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to storage events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to storage events for.
 * @param {function} fn - The callback function to handle the storage event.
 */
declare const listenStorageEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to swarm events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
declare const listenSwarmEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to execution events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {function} fn - The callback function to handle the event.
 */
declare const listenExecutionEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to swarm events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
declare const listenPolicyEvent: (clientId: string, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to agent events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {function} fn - The callback function to handle the event.
 */
declare const listenAgentEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to history events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
declare const listenHistoryEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to session events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to session events for.
 * @param {function} fn - The callback function to handle the session events.
 */
declare const listenSessionEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to state events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to.
 * @param {function} fn - The callback function to handle the event.
 */
declare const listenStateEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to storage events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to storage events for.
 * @param {function} fn - The callback function to handle the storage event.
 */
declare const listenStorageEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to swarm events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
declare const listenSwarmEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to execution events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {function} fn - The callback function to handle the event.
 */
declare const listenExecutionEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/**
 * Hook to subscribe to swarm events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
declare const listenPolicyEventOnce: (clientId: string, filterFn: (event: IBusEvent) => boolean, fn: (event: IBusEvent) => void) => () => void;

/** @private Symbol for memoizing the waitForInit method in LoggerInstance */
declare const LOGGER_INSTANCE_WAIT_FOR_INIT: unique symbol;
/**
 * Callbacks for managing logger instance lifecycle and log events.
 */
interface ILoggerInstanceCallbacks {
    /**
     * Called when the logger instance is initialized.
     * @param {string} clientId - The client ID.
     */
    onInit(clientId: string): void;
    /**
     * Called when the logger instance is disposed.
     * @param {string} clientId - The client ID.
     */
    onDispose(clientId: string): void;
    /**
     * Called when a log message is recorded.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The log topic.
     * @param {...any[]} args - Additional log arguments.
     */
    onLog(clientId: string, topic: string, ...args: any[]): void;
    /**
     * Called when a debug message is recorded.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The debug topic.
     * @param {...any[]} args - Additional debug arguments.
     */
    onDebug(clientId: string, topic: string, ...args: any[]): void;
    /**
     * Called when an info message is recorded.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The info topic.
     * @param {...any[]} args - Additional info arguments.
     */
    onInfo(clientId: string, topic: string, ...args: any[]): void;
}
/**
 * Interface for logger instances, extending the base ILogger with lifecycle methods.
 * @extends {ILogger}
 */
interface ILoggerInstance extends ILogger {
    /**
     * Initializes the logger instance, optionally waiting for setup.
     * @param {boolean} initial - Whether this is the initial setup (affects caching behavior).
     * @returns {Promise<void> | void} A promise that resolves when initialization is complete, or void if synchronous.
     */
    waitForInit(initial: boolean): Promise<void> | void;
    /**
     * Disposes of the logger instance, cleaning up resources.
     * @returns {Promise<void> | void} A promise that resolves when disposal is complete, or void if synchronous.
     */
    dispose(): Promise<void> | void;
}
/**
 * Interface defining methods for interacting with a logger adapter.
 */
interface ILoggerAdapter {
    /**
     * Logs a message for a client.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The log topic.
     * @param {...any[]} args - Additional log arguments.
     * @returns {Promise<void>} A promise that resolves when the log is recorded.
     */
    log(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Logs a debug message for a client.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The debug topic.
     * @param {...any[]} args - Additional debug arguments.
     * @returns {Promise<void>} A promise that resolves when the debug message is recorded.
     */
    debug(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Logs an info message for a client.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The info topic.
     * @param {...any[]} args - Additional info arguments.
     * @returns {Promise<void>} A promise that resolves when the info message is recorded.
     */
    info(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Disposes of the logger instance for a client.
     * @param {string} clientId - The client ID.
     * @returns {Promise<void>} A promise that resolves when disposal is complete.
     */
    dispose(clientId: string): Promise<void>;
}
/**
 * Interface defining control methods for configuring logger behavior.
 */
interface ILoggerControl {
    /**
     * Sets a common logger adapter for all logging operations.
     * @param {ILogger} logger - The logger instance to use.
     */
    useCommonAdapter(logger: ILogger): void;
    /**
     * Configures client-specific lifecycle callbacks for logger instances.
     * @param {Partial<ILoggerInstanceCallbacks>} Callbacks - The callbacks to apply.
     */
    useClientCallbacks(Callbacks: Partial<ILoggerInstanceCallbacks>): void;
    /**
     * Sets a custom logger instance constructor for client-specific logging.
     * @param {TLoggerInstanceCtor} Ctor - The constructor for creating logger instances.
     */
    useClientAdapter(Ctor: TLoggerInstanceCtor): void;
    /**
     * Logs a message for a specific client using the common adapter.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The log topic.
     * @param {...any[]} args - Additional log arguments.
     * @returns {Promise<void>} A promise that resolves when the log is recorded.
     */
    logClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Logs an info message for a specific client using the common adapter.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The info topic.
     * @param {...any[]} args - Additional info arguments.
     * @returns {Promise<void>} A promise that resolves when the info message is recorded.
     */
    infoClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
    /**
     * Logs a debug message for a specific client using the common adapter.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The debug topic.
     * @param {...any[]} args - Additional debug arguments.
     * @returns {Promise<void>} A promise that resolves when the debug message is recorded.
     */
    debugClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
}
/**
 * Constructor type for creating logger instances.
 * @typedef {new (clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>) => ILoggerInstance} TLoggerInstanceCtor
 */
type TLoggerInstanceCtor = new (clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>) => ILoggerInstance;
/**
 * Manages logging operations for a specific client, with customizable callbacks.
 * @implements {ILoggerInstance}
 */
declare class LoggerInstance implements ILoggerInstance {
    readonly clientId: string;
    readonly callbacks: Partial<ILoggerInstanceCallbacks>;
    /**
     * Creates a new logger instance.
     * @param {string} clientId - The client ID associated with this logger.
     * @param {Partial<ILoggerInstanceCallbacks>} callbacks - Optional lifecycle callbacks.
     */
    constructor(clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>);
    /**
     * Memoized initialization function to ensure it runs only once.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     * @private
     */
    private [LOGGER_INSTANCE_WAIT_FOR_INIT];
    /**
     * Initializes the logger instance, invoking the onInit callback if provided.
     * @param {boolean} [initial] - Whether this is the initial setup (unused in this implementation).
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    waitForInit(): Promise<void>;
    /**
     * Logs a message to the console (if enabled) and invokes the onLog callback.
     * @param {string} topic - The topic of the log message.
     * @param {...any[]} args - Additional arguments to log.
     */
    log(topic: string, ...args: any[]): void;
    /**
     * Logs a debug message to the console (if enabled) and invokes the onDebug callback.
     * @param {string} topic - The topic of the debug message.
     * @param {...any[]} args - Additional arguments to debug log.
     */
    debug(topic: string, ...args: any[]): void;
    /**
     * Logs an info message to the console (if enabled) and invokes the onInfo callback.
     * @param {string} topic - The topic of the info message.
     * @param {...any[]} args - Additional arguments to info log.
     */
    info(topic: string, ...args: any[]): void;
    /**
     * Disposes of the logger instance, invoking the onDispose callback if provided.
     * @returns {void} Synchronous operation with no return value.
     */
    dispose(): void;
}
/**
 * Exported Logger Control interface for configuring logger behavior.
 * @type {ILoggerControl}
 */
declare const Logger: ILoggerControl;

declare const GLOBAL_CONFIG: {
    CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT: string;
    CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT: string;
    CC_EMPTY_OUTPUT_PLACEHOLDERS: string[];
    CC_KEEP_MESSAGES: number;
    CC_MAX_TOOL_CALLS: number;
    CC_AGENT_MAP_TOOLS: (tool: IToolCall[], clientId: string, agentName: AgentName) => IToolCall[] | Promise<IToolCall[]>;
    CC_GET_AGENT_HISTORY_ADAPTER: (clientId: string, agentName: AgentName) => IHistoryAdapter;
    CC_GET_CLIENT_LOGGER_ADAPTER: () => ILoggerAdapter;
    CC_SWARM_AGENT_CHANGED: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void>;
    CC_SWARM_DEFAULT_AGENT: (clientId: string, swarmName: SwarmName, defaultAgent: AgentName) => Promise<AgentName>;
    CC_SWARM_DEFAULT_STACK: (clientId: string, swarmName: SwarmName) => Promise<AgentName[]>;
    CC_SWARM_STACK_CHANGED: (clientId: string, navigationStack: AgentName[], swarmName: SwarmName) => Promise<void>;
    CC_AGENT_DEFAULT_VALIDATION: (output: string) => Promise<string | null>;
    CC_AGENT_HISTORY_FILTER: (agentName: AgentName) => (message: IModelMessage) => boolean;
    CC_AGENT_OUTPUT_TRANSFORM: (input: string) => string;
    CC_AGENT_OUTPUT_MAP: (message: IModelMessage) => IModelMessage | Promise<IModelMessage>;
    CC_AGENT_SYSTEM_PROMPT: string[];
    CC_AGENT_DISALLOWED_TAGS: string[];
    CC_AGENT_DISALLOWED_SYMBOLS: string[];
    CC_STORAGE_SEARCH_SIMILARITY: number;
    CC_STORAGE_SEARCH_POOL: number;
    CC_LOGGER_ENABLE_INFO: boolean;
    CC_LOGGER_ENABLE_DEBUG: boolean;
    CC_LOGGER_ENABLE_LOG: boolean;
    CC_LOGGER_ENABLE_CONSOLE: boolean;
    CC_RESQUE_STRATEGY: "flush" | "recomplete" | "custom";
    CC_NAME_TO_TITLE: (name: string) => string;
    CC_FN_PLANTUML: (uml: string) => Promise<string>;
    CC_PROCESS_UUID: string;
    CC_BANHAMMER_PLACEHOLDER: string;
    CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: (clientId: string, agentName: AgentName) => Promise<IModelMessage | null>;
    CC_PERSIST_ENABLED_BY_DEFAULT: boolean;
    CC_AUTOBAN_ENABLED_BY_DEFAULT: boolean;
    CC_DEFAULT_STATE_SET: <T = any>(state: T, clientId: string, stateName: StateName) => Promise<void>;
    CC_DEFAULT_STATE_GET: <T = any>(clientId: string, stateName: StateName, defaultState: T) => Promise<T>;
    CC_DEFAULT_STORAGE_GET: <T extends IStorageData = IStorageData>(clientId: string, storageName: StorageName, defaultValue: T[]) => Promise<T[]>;
    CC_DEFAULT_STORAGE_SET: <T extends IStorageData = IStorageData>(data: T[], clientId: string, storageName: StorageName) => Promise<void>;
    CC_SKIP_POSIX_RENAME: boolean;
};
declare const setConfig: (config: Partial<typeof GLOBAL_CONFIG>) => void;

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
    writeSessionMemory: <T extends object = object>(clientId: string, value: T) => T;
    /**
     * Reads a value from the session memory for a given client.
     * Executes within a context for logging and validation, ensuring the client session is valid.
     * @template T - The type of the value to read, must extend object.
     * @param {string} clientId - The ID of the client whose session memory will be read.
     * @returns {T} The value read from the session memory, as returned by the memory schema service.
     * @throws {Error} If session validation fails or the memory schema service encounters an error.
     */
    readSessionMemory: <T extends object = object>(clientId: string) => T;
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
 * A higher-order function that ensures execution outside of existing method and execution contexts.
 *
 * @template T - Generic type extending any function
 * @param {T} run - The function to be executed outside of existing contexts
 * @returns {(...args: Parameters<T>) => ReturnType<T>} A wrapped function that executes outside of any existing contexts
 *
 * @example
 * const myFunction = (arg: string) => console.log(arg);
 * const contextSafeFunction = beginContext(myFunction);
 * contextSafeFunction('test'); // Executes myFunction outside of any existing contexts
 *
 * @remarks
 * This utility function checks for both MethodContext and ExecutionContext.
 * If either context exists, the provided function will be executed outside of those contexts.
 * This is useful for ensuring clean execution environments for certain operations.
 */
declare const beginContext: <T extends (...args: any[]) => any>(run: T) => ((...args: Parameters<T>) => ReturnType<T>);

declare const Utils: {
    PersistStateUtils: typeof PersistStateUtils;
    PersistSwarmUtils: typeof PersistSwarmUtils;
    PersistStorageUtils: typeof PersistStorageUtils;
};

export { Adapter, type EventSource, ExecutionContextService, History, HistoryMemoryInstance, HistoryPersistInstance, type IAgentSchema, type IAgentTool, type IBaseEvent, type IBusEvent, type IBusEventContext, type ICompletionArgs, type ICompletionSchema, type ICustomEvent, type IEmbeddingSchema, type IHistoryAdapter, type IHistoryControl, type IHistoryInstance, type IHistoryInstanceCallbacks, type IIncomingMessage, type ILoggerAdapter, type ILoggerInstance, type ILoggerInstanceCallbacks, type IMakeConnectionConfig, type IMakeDisposeParams, type IModelMessage, type IOutgoingMessage, type IPersistBase, type IPolicySchema, type ISessionConfig, type IStateSchema, type IStorageSchema, type ISwarmSchema, type ITool, type IToolCall, Logger, LoggerInstance, MethodContextService, PersistBase, PersistList, PersistState, PersistStorage, PersistSwarm, Policy, type ReceiveMessageFn, Schema, type SendMessageFn$1 as SendMessageFn, SharedState, SharedStorage, State, Storage, type THistoryInstanceCtor, type TPersistBaseCtor, Utils, addAgent, addCompletion, addEmbedding, addPolicy, addState, addStorage, addSwarm, addTool, beginContext, cancelOutput, cancelOutputForce, changeToAgent, changeToDefaultAgent, changeToPrevAgent, commitAssistantMessage, commitAssistantMessageForce, commitFlush, commitFlushForce, commitStopTools, commitStopToolsForce, commitSystemMessage, commitSystemMessageForce, commitToolOutput, commitToolOutputForce, commitUserMessage, commitUserMessageForce, complete, disposeConnection, dumpAgent, dumpClientPerformance, dumpDocs, dumpPerfomance, dumpSwarm, emit, emitForce, event, execute, executeForce, getAgentHistory, getAgentName, getAssistantHistory, getLastAssistantMessage, getLastSystemMessage, getLastUserMessage, getRawHistory, getSessionContext, getSessionMode, getUserHistory, listenAgentEvent, listenAgentEventOnce, listenEvent, listenEventOnce, listenExecutionEvent, listenExecutionEventOnce, listenHistoryEvent, listenHistoryEventOnce, listenPolicyEvent, listenPolicyEventOnce, listenSessionEvent, listenSessionEventOnce, listenStateEvent, listenStateEventOnce, listenStorageEvent, listenStorageEventOnce, listenSwarmEvent, listenSwarmEventOnce, makeAutoDispose, makeConnection, runStateless, runStatelessForce, session, setConfig, swarm };
