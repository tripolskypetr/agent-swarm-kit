import * as di_scoped from 'di-scoped';
import * as functools_kit from 'functools-kit';
import { SortedArray, Subject } from 'functools-kit';
import { IStorageData as IStorageData$1, StorageName as StorageName$1 } from 'src/interfaces/Storage.interface';

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
    defaultData?: T[];
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
    defaultState: T;
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

/** Identifier for an entity, can be string or number */
type EntityId = string | number;
/** Base interface for all persistent entities */
interface IEntity {
}
/** Symbol for the wait-for-initialization operation */
declare const BASE_WAIT_FOR_INIT_SYMBOL: unique symbol;
/** Symbol for creating a new key in a persistent list */
declare const LIST_CREATE_KEY_SYMBOL: unique symbol;
/** Symbol for getting the last key in a persistent list */
declare const LIST_GET_LAST_KEY_SYMBOL: unique symbol;
/** Symbol for popping the last item from a persistent list */
declare const LIST_POP_SYMBOL: unique symbol;
/**
 * Base class for persistent storage of entities in a file system
 * @template EntityName - The type of entity name
 */
declare class PersistBase<EntityName extends string = string> {
    readonly entityName: EntityName;
    readonly baseDir: string;
    /** The directory path where entity files are stored */
    _directory: string;
    /**
     * Creates a new PersistBase instance
     * @param entityName - The name of the entity type
     * @param baseDir - The base directory for storing entity files
     */
    constructor(entityName: EntityName, baseDir?: string);
    /**
     * Gets the file path for an entity
     * @param entityId - The ID of the entity
     * @returns The full file path for the entity
     */
    _getFilePath(entityId: EntityId): string;
    /**
     * Initializes the storage directory
     * @returns A Promise that resolves when initialization is complete
     */
    private [BASE_WAIT_FOR_INIT_SYMBOL];
    /**
     * Waits for initialization to complete
     * @param initial - Whether this is the initial initialization
     * @returns A Promise that resolves when initialization is complete
     */
    waitForInit(initial: boolean): Promise<void>;
    /**
     * Gets the count of entities in the storage
     * @returns A Promise resolving to the number of entities
     */
    getCount(): Promise<number>;
    /**
     * Reads an entity from storage
     * @template T - The type of the entity
     * @param entityId - The ID of the entity to read
     * @returns A Promise resolving to the entity
     * @throws Error if the entity is not found or reading fails
     */
    readValue<T extends IEntity = IEntity>(entityId: EntityId): Promise<T>;
    /**
     * Checks if an entity exists in storage
     * @param entityId - The ID of the entity to check
     * @returns A Promise resolving to true if the entity exists, false otherwise
     */
    hasValue(entityId: EntityId): Promise<boolean>;
    /**
     * Writes an entity to storage
     * @template T - The type of the entity
     * @param entityId - The ID of the entity to write
     * @param entity - The entity data to write
     * @returns A Promise that resolves when writing is complete
     * @throws Error if writing fails
     */
    writeValue: <T extends IEntity = IEntity>(entityId: EntityId, entity: T) => Promise<void>;
    /**
     * Removes an entity from storage
     * @param entityId - The ID of the entity to remove
     * @returns A Promise that resolves when removal is complete
     * @throws Error if the entity is not found or removal fails
     */
    removeValue(entityId: EntityId): Promise<void>;
    /**
     * Removes all entities from storage
     * @returns A Promise that resolves when all entities are removed
     * @throws Error if removal fails
     */
    removeAll(): Promise<void>;
    /**
     * Iterates over all entities in storage
     * @template T - The type of the entities
     * @returns An AsyncGenerator yielding entities
     * @throws Error if reading fails
     */
    values<T extends IEntity = IEntity>(): AsyncGenerator<T>;
    /**
     * Iterates over all entity IDs in storage
     * @returns An AsyncGenerator yielding entity IDs
     * @throws Error if reading fails
     */
    keys(): AsyncGenerator<EntityId>;
    /**
     * Implements the Symbol.asyncIterator protocol
     * @returns An AsyncIterableIterator of entities
     */
    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
    /**
     * Filters entities based on a predicate
     * @template T - The type of the entities
     * @param predicate - A function to test each entity
     * @returns An AsyncGenerator yielding entities that pass the predicate
     */
    filter<T extends IEntity = IEntity>(predicate: (value: T) => boolean): AsyncGenerator<Awaited<T>, void, unknown>;
    /**
     * Takes a limited number of entities, optionally filtered
     * @template T - The type of the entities
     * @param total - The maximum number of entities to take
     * @param predicate - Optional function to test each entity
     * @returns An AsyncGenerator yielding up to total entities
     */
    take<T extends IEntity = IEntity>(total: number, predicate?: (value: T) => boolean): AsyncGenerator<Awaited<T>, void, unknown>;
}
/**
 * Class for persistent storage of entities in a list structure
 * @template EntityName - The type of entity name
 * @extends PersistBase
 */
declare class PersistList<EntityName extends string = string> extends PersistBase<EntityName> {
    /** Tracks the last used numeric key */
    _lastCount: number | null;
    /**
     * Creates a new unique key for a list item
     * @returns A Promise resolving to a string key
     */
    private [LIST_CREATE_KEY_SYMBOL];
    /**
     * Gets the key of the last item in the list
     * @returns A Promise resolving to the last key or null if list is empty
     */
    private [LIST_GET_LAST_KEY_SYMBOL];
    /**
     * Removes and returns the last item in the list
     * @template T - The type of the entity
     * @returns A Promise resolving to the removed item or null if list is empty
     */
    private [LIST_POP_SYMBOL];
    /**
     * Adds an entity to the end of the list
     * @template T - The type of the entity
     * @param entity - The entity to add
     * @returns A Promise that resolves when the entity is added
     */
    push<T extends IEntity = IEntity>(entity: T): Promise<void>;
    /**
     * Removes and returns the last entity in the list
     * @template T - The type of the entity
     * @returns A Promise resolving to the removed entity or null if list is empty
     */
    pop(): Promise<IEntity>;
}
/**
 * Utility class for managing swarm-related persistence
 */
declare class PersistSwarmUtils {
    /**
     * Memoized function to get storage for active agents
     * @param swarmName - The name of the swarm
     * @returns A PersistBase instance for the active agent storage
     */
    private getActiveAgentStorage;
    /**
     * Memoized function to get storage for navigation stacks
     * @param swarmName - The name of the swarm
     * @returns A PersistBase instance for the navigation stack storage
     */
    private getNavigationStackStorage;
    /**
     * Gets the active agent for a client in a swarm
     * @param clientId - The client identifier
     * @param swarmName - The name of the swarm
     * @param defaultAgent - The default agent to return if no active agent is set
     * @returns A Promise resolving to the active agent name
     */
    getActiveAgent: (clientId: string, swarmName: SwarmName, defaultAgent: AgentName) => Promise<string>;
    /**
     * Sets the active agent for a client in a swarm
     * @param clientId - The client identifier
     * @param agentName - The name of the agent to set as active
     * @param swarmName - The name of the swarm
     * @returns A Promise that resolves when the active agent is set
     */
    setActiveAgent: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void>;
    /**
     * Gets the navigation stack for a client in a swarm
     * @param clientId - The client identifier
     * @param swarmName - The name of the swarm
     * @returns A Promise resolving to the navigation stack (array of agent names)
     */
    getNavigationStack: (clientId: string, swarmName: SwarmName) => Promise<string[]>;
    /**
     * Sets the navigation stack for a client in a swarm
     * @param clientId - The client identifier
     * @param agentStack - The navigation stack (array of agent names)
     * @param swarmName - The name of the swarm
     * @returns A Promise that resolves when the navigation stack is set
     */
    setNavigationStack: (clientId: string, agentStack: AgentName[], swarmName: SwarmName) => Promise<void>;
}
/**
 * Singleton instance of PersistSwarmUtils for managing swarm persistence
 */
declare const PersistSwarm: PersistSwarmUtils;
/**
 * Utility class for managing state persistence
 */
declare class PersistStateUtils {
    /**
     * Memoized function to get storage for a specific state
     * @param stateName - The name of the state
     * @returns A PersistBase instance for the state storage
     */
    private getStateStorage;
    /**
     * Sets the state for a client
     * @template T - The type of the state
     * @param state - The state data to set
     * @param clientId - The client identifier
     * @param stateName - The name of the state
     * @returns A Promise that resolves when the state is set
     */
    setState: <T = unknown>(state: T, clientId: string, stateName: StateName) => Promise<void>;
    /**
     * Gets the state for a client
     * @template T - The type of the state
     * @param clientId - The client identifier
     * @param stateName - The name of the state
     * @param defaultState - The default state to return if no state is set
     * @returns A Promise resolving to the state data
     */
    getState: <T = unknown>(clientId: string, stateName: StateName, defaultState: T) => Promise<T>;
}
/**
 * Singleton instance of PersistStateUtils for managing state persistence
 */
declare const PersistState: PersistStateUtils;
/**
 * Utility class for managing storage persistence
 */
declare class PersistStorageUtils {
    /**
     * Memoized function to get storage for a specific storage name
     * @param storageName - The name of the storage
     * @returns A PersistBase instance for the storage
     */
    private getPersistStorage;
    /**
     * Gets the data for a client from a specific storage
     * @template T - The type of the storage data
     * @param clientId - The client identifier
     * @param storageName - The name of the storage
     * @param defaultValue - The default value to return if no data is set
     * @returns A Promise resolving to the storage data
     */
    getData: <T extends IStorageData$1 = IStorageData$1>(clientId: string, storageName: StorageName$1, defaultValue: T[]) => Promise<T[]>;
    /**
     * Sets the data for a client in a specific storage
     * @template T - The type of the storage data
     * @param data - The data to set
     * @param clientId - The client identifier
     * @param storageName - The name of the storage
     * @returns A Promise that resolves when the data is set
     */
    setData: <T extends IStorageData$1 = IStorageData$1>(data: T[], clientId: string, storageName: StorageName$1) => Promise<void>;
}
/**
 * Singleton instance of PersistStorageUtils for managing storage persistence
 */
declare const PersistStorage: PersistStorageUtils;

/**
 * Interface for History Adapter Callbacks
 */
interface IHistoryInstanceCallbacks {
    /**
     * Callback for compute of dynamic system prompt
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     * @returns An array of additional system prompt messages
     */
    getSystemPrompt?: (clientId: string, agentName: AgentName) => Promise<string[]> | string[];
    /**
     * Filter condition for history messages.
     * @param message - The model message.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     * @returns A promise that resolves to a boolean indicating whether the message passes the filter.
     */
    filterCondition?: (message: IModelMessage, clientId: string, agentName: AgentName) => Promise<boolean> | boolean;
    /**
     * Get data for the history.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     * @returns A promise that resolves to an array of model messages.
     */
    getData: (clientId: string, agentName: AgentName) => Promise<IModelMessage[]> | IModelMessage[];
    /**
     * Callback for when the history changes.
     * @param data - The array of model messages.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     */
    onChange: (data: IModelMessage[], clientId: string, agentName: AgentName) => void;
    /**
     * Callback for when the history get the new message
     * @param data - The array of model messages.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     */
    onPush: (data: IModelMessage, clientId: string, agentName: AgentName) => void;
    /**
     * Callback for when the history pop the last message
     * @param data - The array of model messages.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     */
    onPop: (data: IModelMessage | null, clientId: string, agentName: AgentName) => void;
    /**
     * Callback for when the history is read. Will be called for each message
     * @param message - The model message.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     */
    onRead: (message: IModelMessage, clientId: string, agentName: AgentName) => void;
    /**
     * Callback for when the read is begin
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     */
    onReadBegin: (clientId: string, agentName: AgentName) => void;
    /**
     * Callback for when the read is end
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     */
    onReadEnd: (clientId: string, agentName: AgentName) => void;
    /**
     * Callback for when the history is disposed.
     * @param clientId - The client ID.
     */
    onDispose: (clientId: string) => void;
    /**
     * Callback for when the history is initialized.
     * @param clientId - The client ID.
     */
    onInit: (clientId: string) => void;
    /**
     * Callback to obtain history ref
     * @param clientId - The client ID.
     */
    onRef: (history: IHistoryInstance) => void;
}
/**
 * Interface for History Adapter
 */
interface IHistoryAdapter {
    /**
     * Iterate over the history messages.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     * @returns An async iterable iterator of model messages.
     */
    iterate(clientId: string, agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Push a new message to the history.
     * @param value - The model message to push.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     * @returns A promise that resolves when the message is pushed.
     */
    push: (value: IModelMessage, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Pop the last message from a history
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     * @returns The last message or null
     */
    pop: (clientId: string, agentName: AgentName) => Promise<IModelMessage | null>;
    /**
     * Dispose of the history for a given client and agent.
     * @param clientId - The client ID.
     * @param agentName - The agent name or null.
     * @returns A promise that resolves when the history is disposed.
     */
    dispose: (clientId: string, agentName: AgentName | null) => Promise<void>;
}
/**
 * Interface for History Control
 */
interface IHistoryControl {
    /**
     * Use a custom history adapter.
     * @param Ctor - The constructor for the history instance.
     */
    useHistoryAdapter(Ctor: THistoryInstanceCtor): void;
    /**
     * Use history lifecycle callbacks.
     * @param Callbacks - The callbacks dictionary.
     */
    useHistoryCallbacks: (Callbacks: Partial<IHistoryInstanceCallbacks>) => void;
}
/**
 * Interface for History Instance
 */
interface IHistoryInstance {
    /**
     * Iterate over the history messages for a given agent.
     * @param agentName - The agent name.
     * @returns An async iterable iterator of model messages.
     */
    iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Wait for the history to initialize.
     * @param agentName - The agent name.
     * @param init - Whether the history is initializing.
     * @returns A promise that resolves when the history is initialized.
     */
    waitForInit(agentName: AgentName, init: boolean): Promise<void>;
    /**
     * Push a new message to the history for a given agent.
     * @param value - The model message to push.
     * @param agentName - The agent name.
     * @returns A promise that resolves when the message is pushed.
     */
    push(value: IModelMessage, agentName: AgentName): Promise<void>;
    /**
     * Pop the last message from a history
     * @param value - The model message to push.
     * @param agentName - The agent name.
     * @returns A promise that resolves the last message or null
     */
    pop(agentName: AgentName): Promise<IModelMessage | null>;
    /**
     * Dispose of the history for a given agent.
     * @param agentName - The agent name or null.
     * @returns A promise that resolves when the history is disposed.
     */
    dispose(agentName: AgentName | null): Promise<void>;
}
/**
 * Type for History Instance Constructor
 */
type THistoryInstanceCtor = new (clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>) => IHistoryInstance;
declare const HISTORY_MEMORY_INSTANCE_WAIT_FOR_INIT: unique symbol;
declare const HISTORY_PERSIST_INSTANCE_WAIT_FOR_INIT: unique symbol;
/**
 * Class representing a persistent history instance.
 * This class implements the IHistoryInstance interface and provides methods
 * to manage and persist history messages.
 */
declare class HistoryPersistInstance implements IHistoryInstance {
    readonly clientId: string;
    readonly callbacks: Partial<IHistoryInstanceCallbacks>;
    _array: IModelMessage[];
    _persistStorage: PersistList;
    /**
     * Makes the singleshot for initialization
     * @param agentName - The agent name.
     */
    private [HISTORY_PERSIST_INSTANCE_WAIT_FOR_INIT];
    /**
     * Wait for the history to initialize.
     * @param agentName - The agent name.
     * @param isInitial - Whether the history is initializing.
     * @returns A promise that resolves when the history is initialized.
     */
    waitForInit(agentName: AgentName): Promise<void>;
    /**
     * Create a HistoryPersistInstance.
     * @param clientId - The client ID.
     * @param callbacks - The callbacks for the history instance.
     */
    constructor(clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>);
    /**
     * Iterate over the history messages for a given agent.
     * @param agentName - The agent name.
     * @returns An async iterable iterator of model messages.
     */
    iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Push a new message to the history for a given agent.
     * @param value - The model message to push.
     * @param agentName - The agent name.
     * @returns A promise that resolves when the message is pushed.
     */
    push(value: IModelMessage, agentName: AgentName): Promise<void>;
    /**
     * Pop the last message from the history for a given agent.
     * @param agentName - The agent name.
     * @returns A promise that resolves to the last message or null.
     */
    pop(agentName: AgentName): Promise<IModelMessage>;
    /**
     * Dispose of the history for a given agent.
     * @param agentName - The agent name or null.
     * @returns A promise that resolves when the history is disposed.
     */
    dispose(agentName: AgentName | null): Promise<void>;
}
/**
 * Class representing a History Instance
 */
declare class HistoryMemoryInstance implements IHistoryInstance {
    readonly clientId: string;
    readonly callbacks: Partial<IHistoryInstanceCallbacks>;
    _array: IModelMessage[];
    /**
     * Makes the singleshot for initialization
     * @param agentName - The agent name.
     */
    private [HISTORY_MEMORY_INSTANCE_WAIT_FOR_INIT];
    /**
     * Wait for the history to initialize.
     * @param agentName - The agent name.
     */
    waitForInit(agentName: AgentName): Promise<void>;
    /**
     * Create a HistoryMemoryInstance.
     * @param clientId - The client ID.
     * @param callbacks - The callbacks for the history instance.
     */
    constructor(clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>);
    /**
     * Iterate over the history messages for a given agent.
     * @param agentName - The agent name.
     * @returns An async iterable iterator of model messages.
     */
    iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Push a new message to the history for a given agent.
     * @param value - The model message to push.
     * @param agentName - The agent name.
     * @returns A promise that resolves when the message is pushed.
     */
    push(value: IModelMessage, agentName: AgentName): Promise<void>;
    /**
     * Pop the last message from a history
     * @param agentName - The agent name.
     * @returns A promise that resolves when the message is pushed.
     */
    pop(agentName: AgentName): Promise<IModelMessage>;
    /**
     * Dispose of the history for a given agent.
     * @param agentName - The agent name or null.
     * @returns A promise that resolves when the history is disposed.
     */
    dispose(agentName: AgentName | null): Promise<void>;
}
/**
 * Class representing History Utilities
 */
declare class HistoryUtils implements IHistoryAdapter, IHistoryControl {
    private HistoryFactory;
    private HistoryCallbacks;
    private getHistory;
    /**
     * Use a custom history adapter.
     * @param Ctor - The constructor for the history instance.
     */
    useHistoryAdapter: (Ctor: THistoryInstanceCtor) => void;
    /**
     * Use history lifecycle callbacks.
     * @param Callbacks - The callbacks dictionary.
     */
    useHistoryCallbacks: (Callbacks: Partial<IHistoryInstanceCallbacks>) => void;
    /**
     * Iterate over the history messages.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     * @returns An async iterable iterator of model messages.
     */
    iterate(clientId: string, agentName: AgentName): AsyncIterableIterator<IModelMessage>;
    /**
     * Push a new message to the history.
     * @param value - The model message to push.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     * @returns A promise that resolves when the message is pushed.
     */
    push: (value: IModelMessage, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Pop the last message from the history.
     * @param value - The model message to push.
     * @param clientId - The client ID.
     * @param agentName - The agent name.
     * @returns A promise that resolves when the message is pushed.
     */
    pop: (clientId: string, agentName: AgentName) => Promise<IModelMessage>;
    /**
     * Dispose of the history for a given client and agent.
     * @param clientId - The client ID.
     * @param agentName - The agent name or null.
     * @returns A promise that resolves when the history is disposed.
     */
    dispose: (clientId: string, agentName: AgentName | null) => Promise<void>;
}
/**
 * Exported History Adapter instance
 */
declare const HistoryAdapter: HistoryUtils;
/**
 * Exported History Control instance
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
 * Represents a client agent that interacts with the system.
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
     * @param {IAgentParams} params - The parameters for the agent.
     */
    constructor(params: IAgentParams);
    /**
     * Emits the output result after validation.
     * @param {string} result - The result to be emitted.
     * @returns {Promise<void>}
     * @private
     */
    _emitOutput(mode: ExecutionMode, rawResult: string): Promise<void>;
    /**
     * Resurrects the model based on the given reason.
     * @param {string} [reason] - The reason for resurrecting the model.
     * @returns {Promise<string>}
     * @private
     */
    _resurrectModel(mode: ExecutionMode, reason?: string): Promise<string>;
    /**
     * Waits for the output to be available.
     * @returns {Promise<string>}
     */
    waitForOutput(): Promise<string>;
    /**
     * Gets the completion message from the model.
     * @returns {Promise<IModelMessage>}
     */
    getCompletion(mode: ExecutionMode): Promise<IModelMessage>;
    /**
     * Commits a user message to the history without answer.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>}
     */
    commitUserMessage(message: string): Promise<void>;
    /**
     * Commits flush of agent history
     * @returns {Promise<void>}
     */
    commitFlush(): Promise<void>;
    /**
     * Commits change of agent to prevent the next tool execution from being called.
     * @returns {Promise<void>}
     */
    commitAgentChange(): Promise<void>;
    /**
     * Commits change of agent to prevent the next tool execution from being called.
     * @returns {Promise<void>}
     */
    commitStopTools(): Promise<void>;
    /**
     * Commits a system message to the history.
     * @param {string} message - The system message to commit.
     * @returns {Promise<void>}
     */
    commitSystemMessage(message: string): Promise<void>;
    /**
     * Commits an assistant message to the history without execute.
     * @param {string} message - The system message to commit.
     * @returns {Promise<void>}
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Commits the tool output to the history.
     * @param {string} content - The tool output content.
     * @returns {Promise<void>}
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Executes the incoming message and processes tool calls if any.
     * @param {string} incoming - The incoming message content.
     * @returns {Promise<void>}
     */
    execute: IAgent["execute"];
    /**
     * Run the completion stateless and return the output
     * @param {string} incoming - The incoming message content.
     * @returns {Promise<void>}
     */
    run: IAgent["run"];
    /**
     * Should call on agent dispose
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
 * Class representing the history of client messages.
 * @implements {IHistory}
 */
declare class ClientHistory implements IHistory {
    readonly params: IHistoryParams;
    /**
     * Filter condition for `toArrayForAgent`
     */
    _filterCondition: (message: IModelMessage) => boolean;
    /**
     * Creates an instance of ClientHistory.
     * @param {IHistoryParams} params - The parameters for the history.
     */
    constructor(params: IHistoryParams);
    /**
     * Pushes a message to the history.
     * @param {IModelMessage} message - The message to push.
     * @returns {Promise<void>}
     */
    push(message: IModelMessage): Promise<void>;
    /**
     * Pop a message from the history.
     * @returns {Promise<IModelMessage | null>}
     */
    pop(): Promise<IModelMessage | null>;
    /**
     * Converts the history to an array of raw messages.
     * @returns {Promise<IModelMessage[]>} - The array of raw messages.
     */
    toArrayForRaw(): Promise<IModelMessage[]>;
    /**
     * Converts the history to an array of messages for the agent.
     * @param {string} prompt - The prompt message.
     * @param {string} system - The tool calling protocol
     * @returns {Promise<IModelMessage[]>} - The array of messages for the agent.
     */
    toArrayForAgent(prompt: string, system?: string[]): Promise<IModelMessage[]>;
    /**
     * Should call on agent dispose
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
 * ClientSwarm class implements the ISwarm interface and manages agents within a swarm.
 */
declare class ClientSwarm implements ISwarm {
    readonly params: ISwarmParams;
    _agentChangedSubject: Subject<[agentName: string, agent: IAgent]>;
    _activeAgent: AgentName | typeof AGENT_NEED_FETCH;
    _navigationStack: AgentName[] | typeof STACK_NEED_FETCH;
    _cancelOutputSubject: Subject<{
        agentName: string;
        output: string;
    }>;
    get _agentList(): [string, IAgent][];
    /**
     * Creates an instance of ClientSwarm.
     * @param {ISwarmParams} params - The parameters for the swarm.
     */
    constructor(params: ISwarmParams);
    /**
     * Pop the navigation stack or return default agent
     * @returns {Promise<string>} - The pending agent for navigation
     */
    navigationPop(): Promise<string>;
    /**
     * Cancel the await of output by emit of empty string
     * @returns {Promise<string>} - The output from the active agent.
     */
    cancelOutput(): Promise<void>;
    /**
     * Waits for output from the active agent.
     * @returns {Promise<string>} - The output from the active agent.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Gets the name of the active agent.
     * @returns {Promise<AgentName>} - The name of the active agent.
     */
    getAgentName(): Promise<AgentName>;
    /**
     * Gets the active agent.
     * @returns {Promise<IAgent>} - The active agent.
     */
    getAgent(): Promise<IAgent>;
    /**
     * Sets the reference of an agent in the swarm.
     * @param {AgentName} agentName - The name of the agent.
     * @param {IAgent} agent - The agent instance.
     * @throws {Error} - If the agent is not in the swarm.
     */
    setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
    /**
     * Sets the active agent by name.
     * @param {AgentName} agentName - The name of the agent to set as active.
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
 * ClientSession class implements the ISession interface.
 */
declare class ClientSession implements ISession {
    readonly params: ISessionParams;
    readonly _emitSubject: Subject<string>;
    /**
     * Constructs a new ClientSession instance.
     * @param {ISessionParams} params - The session parameters.
     */
    constructor(params: ISessionParams);
    /**
     * Emits a message.
     * @param {string} message - The message to emit.
     * @returns {Promise<void>}
     */
    emit(message: string): Promise<void>;
    /**
     * Executes a message and optionally emits the output.
     * @param {string} message - The message to execute.
     * @param {boolean} [noEmit=false] - Whether to emit the output or not.
     * @returns {Promise<string>} - The output of the execution.
     */
    execute(message: string, mode: ExecutionMode): Promise<string>;
    /**
     * Run the completion stateless
     * @param {string} message - The message to run.
     * @returns {Promise<string>} - The output of the execution.
     */
    run(message: string): Promise<string>;
    /**
     * Commits tool output.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param {string} content - The content to commit.
     * @returns {Promise<void>}
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
    /**
     * Commits user message without answer.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>}
     */
    commitUserMessage(message: string): Promise<void>;
    /**
     * Commits flush of agent history
     * @returns {Promise<void>}
     */
    commitFlush(): Promise<void>;
    /**
     * Commits stop of the nexttool execution
     * @returns {Promise<void>}
     */
    commitStopTools(): Promise<void>;
    /**
     * Commits a system message.
     * @param {string} message - The system message to commit.
     * @returns {Promise<void>}
     */
    commitSystemMessage(message: string): Promise<void>;
    /**
     * Commits an assistant message.
     * @param {string} message - The assistant message to commit.
     * @returns {Promise<void>}
     */
    commitAssistantMessage(message: string): Promise<void>;
    /**
     * Connects the session to a connector function.
     * @param {SendMessageFn} connector - The connector function.
     * @returns {ReceiveMessageFn<string>} - The function to receive messages.
     */
    connect(connector: SendMessageFn$1): ReceiveMessageFn<string>;
    /**
     * Should call on session dispose
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
 * ClientStorage class to manage storage operations.
 * @template T - The type of storage data.
 */
declare class ClientStorage<T extends IStorageData = IStorageData> implements IStorage<T> {
    readonly params: IStorageParams<T>;
    _itemMap: Map<string | number, T>;
    /**
     * Creates an instance of ClientStorage.
     * @param {IStorageParams<T>} params - The storage parameters.
     */
    constructor(params: IStorageParams<T>);
    /**
     * Creates an embedding for the given item.
     * @param {T} item - The item to create an embedding for.
     * @returns {Promise<readonly [any, any]>} - The embeddings and index.
     */
    _createEmbedding: ((item: T) => Promise<readonly [Embeddings, string]>) & functools_kit.IClearableMemoize<string | number> & functools_kit.IControlMemoize<string | number, Promise<readonly [Embeddings, string]>>;
    /**
     * Waits for the initialization of the storage.
     * @returns {Promise<void>}
     */
    waitForInit: (() => Promise<void>) & functools_kit.ISingleshotClearable;
    /**
     * Takes a specified number of items based on the search criteria.
     * @param {string} search - The search string.
     * @param {number} total - The total number of items to take.
     * @param {number} [score=GLOBAL_CONFIG.CC_STORAGE_SEARCH_SIMILARITY] - The similarity score.
     * @returns {Promise<T[]>} - The list of items.
     */
    take(search: string, total: number, score?: number): Promise<T[]>;
    /**
     * Upserts an item into the storage.
     * @param {T} item - The item to upsert.
     * @returns {Promise<void>}
     */
    upsert(item: T): Promise<void>;
    /**
     * Removes an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @returns {Promise<void>}
     */
    remove(itemId: IStorageData["id"]): Promise<void>;
    /**
     * Clears all items from the storage.
     * @returns {Promise<void>}
     */
    clear(): Promise<void>;
    /**
     * Gets an item by its ID.
     * @param {IStorageData["id"]} itemId - The ID of the item to get.
     * @returns {Promise<T | null>} - The item or null if not found.
     */
    get(itemId: IStorageData["id"]): Promise<T | null>;
    /**
     * Lists all items in the storage, optionally filtered by a predicate.
     * @param {(item: T) => boolean} [filter] - The filter predicate.
     * @returns {Promise<T[]>} - The list of items.
     */
    list(filter?: (item: T) => boolean): Promise<T[]>;
    /**
     * Disposes of the state.
     * @returns {Promise<void>}
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
    getStorage: ((clientId: string, storageName: StorageName) => ClientStorage<IStorageData>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientStorage<IStorageData>>;
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
 * Class representing the client state.
 * @template State - The type of the state data.
 * @implements {IState<State>}
 */
declare class ClientState<State extends IStateData = IStateData> implements IState<State> {
    readonly params: IStateParams<State>;
    _state: State;
    dispatch: (action: string, payload?: DispatchFn<State>) => Promise<State>;
    /**
     * Creates an instance of ClientState.
     * @param {IStateParams<State>} params - The state parameters.
     */
    constructor(params: IStateParams<State>);
    /**
     * Waits for the state to initialize.
     * @returns {Promise<void>}
     */
    waitForInit: (() => Promise<void>) & functools_kit.ISingleshotClearable;
    /**
     * Sets the state using the provided dispatch function.
     * @param {DispatchFn<State>} dispatchFn - The dispatch function.
     * @returns {Promise<State>}
     */
    setState(dispatchFn: DispatchFn<State>): Promise<State>;
    /**
     * Sets the to initial value
     * @returns {Promise<State>}
     */
    clearState(): Promise<State>;
    /**
     * Gets the current state.
     * @returns {Promise<State>}
     */
    getState(): Promise<State>;
    /**
     * Disposes of the state.
     * @returns {Promise<void>}
     */
    dispose(): void;
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
    getStorage: ((storageName: StorageName) => ClientStorage<IStorageData>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientStorage<IStorageData>>;
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
 * Class representing a client policy.
 * @implements {IPolicy}
 */
declare class ClientPolicy implements IPolicy {
    readonly params: IPolicyParams;
    _banSet: Set<SessionId> | typeof BAN_NEED_FETCH;
    /**
     * Creates an instance of ClientPolicy.
     * @param {IPolicyParams} params - The policy parameters.
     */
    constructor(params: IPolicyParams);
    /**
     * Check if client is banned
     * @param {SessionId} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<boolean>}
     */
    hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Gets the ban message for a client.
     * @param {SessionId} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<string>} The ban message.
     */
    getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;
    /**
     * Validates the input from a client.
     * @param {string} incoming - The incoming message.
     * @param {SessionId} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<boolean>} Whether the input is valid.
     */
    validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Validates the output to a client.
     * @param {string} outgoing - The outgoing message.
     * @param {SessionId} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<boolean>} Whether the output is valid.
     */
    validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
    /**
     * Bans a client.
     * @param {SessionId} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
    /**
     * Unbans a client.
     * @param {SessionId} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
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

declare const LOGGER_INSTANCE_WAIT_FOR_INIT: unique symbol;
/**
 * @interface ILoggerInstanceCallbacks
 * @description Callbacks for logger instance events.
 */
interface ILoggerInstanceCallbacks {
    onInit(clientId: string): void;
    onDispose(clientId: string): void;
    onLog(clientId: string, topic: string, ...args: any[]): void;
    onDebug(clientId: string, topic: string, ...args: any[]): void;
    onInfo(clientId: string, topic: string, ...args: any[]): void;
}
/**
 * @interface ILoggerInstance
 * @extends ILogger
 * @description Interface for logger instances.
 */
interface ILoggerInstance extends ILogger {
    waitForInit(initial: boolean): Promise<void> | void;
    dispose(): Promise<void> | void;
}
/**
 * @interface ILoggerAdapter
 * @description Interface for logger adapter.
 */
interface ILoggerAdapter {
    log(clientId: string, topic: string, ...args: any[]): Promise<void>;
    debug(clientId: string, topic: string, ...args: any[]): Promise<void>;
    info(clientId: string, topic: string, ...args: any[]): Promise<void>;
    dispose(clientId: string): Promise<void>;
}
/**
 * @interface ILoggerControl
 * @description Interface for logger control.
 */
interface ILoggerControl {
    useCommonAdapter(logger: ILogger): void;
    useClientCallbacks(Callbacks: Partial<ILoggerInstanceCallbacks>): void;
    useClientAdapter(Ctor: TLoggerInstanceCtor): void;
    logClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
    infoClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
    debugClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
}
type TLoggerInstanceCtor = new (clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>) => ILoggerInstance;
/**
 * @class LoggerInstance
 * @implements ILoggerInstance
 * @description Logger instance class.
 */
declare class LoggerInstance implements ILoggerInstance {
    readonly clientId: string;
    readonly callbacks: Partial<ILoggerInstanceCallbacks>;
    constructor(clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>);
    private [LOGGER_INSTANCE_WAIT_FOR_INIT];
    /**
     * @method waitForInit
     * @description Waits for initialization.
     * @returns {Promise<void>}
     */
    waitForInit(): Promise<void>;
    /**
     * @method log
     * @description Logs a message.
     * @param {string} topic - The topic of the log.
     * @param {...any[]} args - The log arguments.
     */
    log(topic: string, ...args: any[]): void;
    /**
     * @method debug
     * @description Logs a debug message.
     * @param {string} topic - The topic of the debug log.
     * @param {...any[]} args - The debug log arguments.
     */
    debug(topic: string, ...args: any[]): void;
    /**
     * @method info
     * @description Logs an info message.
     * @param {string} topic - The topic of the info log.
     * @param {...any[]} args - The info log arguments.
     */
    info(topic: string, ...args: any[]): void;
    /**
     * @method dispose
     * @description Disposes the logger instance.
     */
    dispose(): void;
}
/**
 * @class LoggerUtils
 * @implements ILoggerAdapter, ILoggerControl
 * @description Utility class for logger.
 */
declare class LoggerUtils implements ILoggerAdapter, ILoggerControl {
    private LoggerFactory;
    private LoggerCallbacks;
    private getLogger;
    /**
     * @method useCommonAdapter
     * @description Sets the common logger adapter.
     * @param {ILogger} logger - The logger instance.
     */
    useCommonAdapter: (logger: ILogger) => void;
    /**
     * @method useClientCallbacks
     * @description Sets the client-specific callbacks.
     * @param {Partial<ILoggerInstanceCallbacks>} Callbacks - The callbacks.
     */
    useClientCallbacks: (Callbacks: Partial<ILoggerInstanceCallbacks>) => void;
    /**
     * @method useClientAdapter
     * @description Sets the client-specific logger adapter.
     * @param {TLoggerInstanceCtor} Ctor - The logger instance constructor.
     */
    useClientAdapter: (Ctor: TLoggerInstanceCtor) => void;
    /**
     * @method logClient
     * @description Logs a message for a specific client.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The topic of the log.
     * @param {...any[]} args - The log arguments.
     * @returns {Promise<void>}
     */
    logClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>;
    /**
     * @method infoClient
     * @description Logs an info message for a specific client.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The topic of the info log.
     * @param {...any[]} args - The info log arguments.
     * @returns {Promise<void>}
     */
    infoClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>;
    /**
     * @method debugClient
     * @description Logs a debug message for a specific client.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The topic of the debug log.
     * @param {...any[]} args - The debug log arguments.
     * @returns {Promise<void>}
     */
    debugClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>;
    /**
     * @method log
     * @description Logs a message.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The topic of the log.
     * @param {...any[]} args - The log arguments.
     * @returns {Promise<void>}
     */
    log: (clientId: string, topic: string, ...args: any[]) => Promise<void>;
    /**
     * @method debug
     * @description Logs a debug message.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The topic of the debug log.
     * @param {...any[]} args - The debug log arguments.
     * @returns {Promise<void>}
     */
    debug: (clientId: string, topic: string, ...args: any[]) => Promise<void>;
    /**
     * @method info
     * @description Logs an info message.
     * @param {string} clientId - The client ID.
     * @param {string} topic - The topic of the info log.
     * @param {...any[]} args - The info log arguments.
     * @returns {Promise<void>}
     */
    info: (clientId: string, topic: string, ...args: any[]) => Promise<void>;
    /**
     * @method dispose
     * @description Disposes the logger instance.
     * @param {string} clientId - The client ID.
     * @returns {Promise<void>}
     */
    dispose: (clientId: string) => Promise<void>;
}
/**
 * @constant LoggerAdapter
 * @description Singleton instance of LoggerUtils.
 */
declare const LoggerAdapter: LoggerUtils;
/**
 * @constant Logger
 * @description Logger control interface.
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
    CC_DEFAULT_STORAGE_GET: <T extends IStorageData$1 = IStorageData$1>(clientId: string, storageName: StorageName$1, defaultValue: T[]) => Promise<T[]>;
    CC_DEFAULT_STORAGE_SET: <T extends IStorageData$1 = IStorageData$1>(data: T[], clientId: string, storageName: StorageName$1) => Promise<void>;
};
declare const setConfig: (config: Partial<typeof GLOBAL_CONFIG>) => void;

/**
 * PolicyUtils class provides utility methods for banning and unbanning clients.
 */
declare class PolicyUtils {
    /**
     * Bans a client.
     * @param {Object} payload - The payload containing clientId, swarmName, and policyName.
     * @param {string} payload.clientId - The client ID.
     * @param {SwarmName} payload.swarmName - The name of the swarm.
     * @param {PolicyName} payload.policyName - The name of the policy.
     * @returns {Promise<void>}
     */
    banClient: (payload: {
        clientId: string;
        swarmName: SwarmName;
        policyName: PolicyName;
    }) => Promise<void>;
    /**
     * Unbans a client.
     * @param {Object} payload - The payload containing clientId, swarmName, and policyName.
     * @param {string} payload.clientId - The client ID.
     * @param {SwarmName} payload.swarmName - The name of the swarm.
     * @param {PolicyName} payload.policyName - The name of the policy.
     * @returns {Promise<void>}
     */
    unbanClient: (payload: {
        clientId: string;
        swarmName: SwarmName;
        policyName: PolicyName;
    }) => Promise<void>;
    /**
     * Check if client is banned
     * @param {Object} payload - The payload containing clientId, swarmName, and policyName.
     * @param {string} payload.clientId - The client ID.
     * @param {SwarmName} payload.swarmName - The name of the swarm.
     * @param {PolicyName} payload.policyName - The name of the policy.
     * @returns {Promise<boolean>}
     */
    hasBan: (payload: {
        clientId: string;
        swarmName: SwarmName;
        policyName: PolicyName;
    }) => Promise<boolean>;
}
/**
 * An instance of PolicyUtils.
 * @type {PolicyUtils}
 */
declare const Policy: PolicyUtils;

type TState = {
    [key in keyof IState]: unknown;
};
/**
 * Utility class for managing state in the agent swarm.
 * @implements {TState}
 */
declare class StateUtils implements TState {
    /**
     * Retrieves the state for a given client and state name.
     * @template T
     * @param {Object} payload - The payload containing client and state information.
     * @param {string} payload.clientId - The client ID.
     * @param {AgentName} payload.agentName - The agent name.
     * @param {StateName} payload.stateName - The state name.
     * @returns {Promise<T>} The state data.
     * @throws Will throw an error if the state is not registered in the agent.
     */
    getState: <T extends unknown = any>(payload: {
        clientId: string;
        agentName: AgentName;
        stateName: StateName;
    }) => Promise<T>;
    /**
     * Sets the state for a given client and state name.
     * @template T
     * @param {T | ((prevState: T) => Promise<T>)} dispatchFn - The new state or a function that returns the new state.
     * @param {Object} payload - The payload containing client and state information.
     * @param {string} payload.clientId - The client ID.
     * @param {AgentName} payload.agentName - The agent name.
     * @param {StateName} payload.stateName - The state name.
     * @returns {Promise<void>}
     * @throws Will throw an error if the state is not registered in the agent.
     */
    setState: <T extends unknown = any>(dispatchFn: T | ((prevState: T) => Promise<T>), payload: {
        clientId: string;
        agentName: AgentName;
        stateName: StateName;
    }) => Promise<void>;
    /**
     * Set the state to initial value
     * @template T
     * @param {Object} payload - The payload containing client and state information.
     * @param {string} payload.clientId - The client ID.
     * @param {AgentName} payload.agentName - The agent name.
     * @param {StateName} payload.stateName - The state name.
     * @returns {Promise<void>}
     * @throws Will throw an error if the state is not registered in the agent.
     */
    clearState: <T extends unknown = any>(payload: {
        clientId: string;
        agentName: AgentName;
        stateName: StateName;
    }) => Promise<T>;
}
/**
 * Instance of StateUtils for managing state.
 * @type {StateUtils}
 */
declare const State: StateUtils;

type TSharedState = {
    [key in keyof IState]: unknown;
};
/**
 * Utility class for managing state in the agent swarm.
 * @implements {TSharedState}
 */
declare class SharedStateUtils implements TSharedState {
    /**
     * Retrieves the state for a given client and state name.
     * @template T
     * @param {Object} payload - The payload containing client and state information.
     * @param {StateName} payload.stateName - The state name.
     * @returns {Promise<T>} The state data.
     * @throws Will throw an error if the state is not registered in the agent.
     */
    getState: <T extends unknown = any>(stateName: StateName) => Promise<T>;
    /**
     * Sets the state for a given client and state name.
     * @template T
     * @param {T | ((prevSharedState: T) => Promise<T>)} dispatchFn - The new state or a function that returns the new state.
     * @param {StateName} stateName - The state name.
     * @returns {Promise<void>}
     * @throws Will throw an error if the state is not registered in the agent.
     */
    setState: <T extends unknown = any>(dispatchFn: T | ((prevSharedState: T) => Promise<T>), stateName: StateName) => Promise<void>;
    /**
     * Set the state to initial value
     * @template T
     * @param {StateName} payload.stateName - The state name.
     * @returns {Promise<void>}
     * @throws Will throw an error if the state is not registered in the agent.
     */
    clearState: <T extends unknown = any>(stateName: StateName) => Promise<T>;
}
/**
 * Instance of SharedStateUtils for managing state.
 * @type {SharedStateUtils}
 */
declare const SharedState: SharedStateUtils;

type TStorage = {
    [key in keyof IStorage]: unknown;
};
declare class StorageUtils implements TStorage {
    /**
     * Takes items from the storage.
     * @param {string} search - The search query.
     * @param {number} total - The total number of items to take.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<T[]>} - A promise that resolves to an array of items.
     * @template T
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
     * Upserts an item in the storage.
     * @param {T} item - The item to upsert.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     * @template T
     */
    upsert: <T extends IStorageData = IStorageData>(payload: {
        item: T;
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
    }) => Promise<void>;
    /**
     * Removes an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    remove: (payload: {
        itemId: IStorageData["id"];
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
    }) => Promise<void>;
    /**
     * Gets an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to get.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<T | null>} - A promise that resolves to the item or null if not found.
     * @template T
     */
    get: <T extends IStorageData = IStorageData>(payload: {
        itemId: IStorageData["id"];
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
    }) => Promise<T | null>;
    /**
     * Lists items from the storage.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @param {StorageName} storageName - The storage name.
     * @param {(item: T) => boolean} [filter] - Optional filter function.
     * @returns {Promise<T[]>} - A promise that resolves to an array of items.
     * @template T
     */
    list: <T extends IStorageData = IStorageData>(payload: {
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
        filter?: (item: T) => boolean;
    }) => Promise<T[]>;
    /**
     * Clears the storage.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    clear: (payload: {
        clientId: string;
        agentName: AgentName;
        storageName: StorageName;
    }) => Promise<void>;
}
declare const Storage: StorageUtils;

type TSharedStorage = {
    [key in keyof IStorage]: unknown;
};
declare class SharedStorageUtils implements TSharedStorage {
    /**
     * Takes items from the storage.
     * @param {string} search - The search query.
     * @param {number} total - The total number of items to take.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<T[]>} - A promise that resolves to an array of items.
     * @template T
     */
    take: <T extends IStorageData = IStorageData>(payload: {
        search: string;
        total: number;
        storageName: StorageName;
        score?: number;
    }) => Promise<T[]>;
    /**
     * Upserts an item in the storage.
     * @param {T} item - The item to upsert.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     * @template T
     */
    upsert: <T extends IStorageData = IStorageData>(item: T, storageName: StorageName) => Promise<void>;
    /**
     * Removes an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    remove: (itemId: IStorageData["id"], storageName: StorageName) => Promise<void>;
    /**
     * Gets an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to get.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<T | null>} - A promise that resolves to the item or null if not found.
     * @template T
     */
    get: <T extends IStorageData = IStorageData>(itemId: IStorageData["id"], storageName: StorageName) => Promise<T | null>;
    /**
     * Lists items from the storage.
     * @param {StorageName} storageName - The storage name.
     * @param {(item: T) => boolean} [filter] - Optional filter function.
     * @returns {Promise<T[]>} - A promise that resolves to an array of items.
     * @template T
     */
    list: <T extends IStorageData = IStorageData>(storageName: StorageName, filter?: (item: T) => boolean) => Promise<T[]>;
    /**
     * Clears the storage.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    clear: (storageName: string) => Promise<void>;
}
declare const SharedStorage: SharedStorageUtils;

/**
 * Utility class for schema-related operations.
 */
declare class SchemaUtils {
    /**
     * Writes a value to the session memory for a given client.
     *
     * @template T - The type of the value to write.
     * @param {string} clientId - The ID of the client.
     * @param {T} value - The value to write to the session memory.
     * @returns {T} The actual value from the session memory.
     */
    writeSessionMemory: <T extends object = object>(clientId: string, value: T) => T;
    /**
     * Reads a value from the session memory for a given client.
     *
     * @template T - The type of the value to read.
     * @param {string} clientId - The ID of the client.
     * @returns {T} The value read from the session memory.
     */
    readSessionMemory: <T extends object = object>(clientId: string) => T;
    /**
     * Serializes an object or an array of objects into a formatted string.
     *
     * @template T - The type of the object.
     * @param {T[] | T} data - The data to serialize.
     * @returns {string} The serialized string.
     */
    serialize: <T extends object = any>(data: T[] | T, map?: {
        mapKey?: typeof GLOBAL_CONFIG.CC_NAME_TO_TITLE;
        mapValue?: (key: string, value: string) => string;
    }) => string;
}
/**
 * An instance of the SchemaUtils class.
 */
declare const Schema: SchemaUtils;

declare class AdapterUtils {
    /**
     * Creates a function to interact with OpenAI's chat completions.
     *
     * @param {any} openai - The OpenAI instance.
     * @param {string} [model="gpt-3.5-turbo"] - The model to use for completions.
     * @returns {Function} - A function that takes completion arguments and returns a response from OpenAI.
     */
    fromOpenAI: (openai: any, model?: string, response_format?: {
        type: string;
    }) => ({ agentName, messages: rawMessages, mode, tools, clientId, }: ICompletionArgs) => Promise<{
        content: any;
        mode: ExecutionMode;
        agentName: string;
        role: any;
        tool_calls: any;
    }>;
    /**
     * Creates a function to interact with LMStudio's chat completions.
     *
     * @param {any} openai - The LMStudio instance.
     * @param {string} [model="saiga_yandexgpt_8b_gguf"] - The model to use for completions.
     * @param {Object} [response_format] - The format of the response.
     * @returns {Function} - A function that takes completion arguments and returns a response from LMStudio.
     */
    fromLMStudio: (openai: any, model?: string, response_format?: {
        type: string;
    }) => ({ agentName, messages: rawMessages, mode, tools, clientId, }: ICompletionArgs) => Promise<{
        content: any;
        mode: ExecutionMode;
        agentName: string;
        role: any;
        tool_calls: any;
    }>;
    /**
     * Creates a function to interact with Ollama's chat completions.
     *
     * @param {any} ollama - The Ollama instance.
     * @param {string} [model="nemotron-mini:4b"] - The model to use for completions.
     * @param {string} [tool_call_protocol=TOOL_PROTOCOL_PROMPT] - The protocol for tool calls.
     * @returns {Function} - A function that takes completion arguments and returns a response from Ollama.
     */
    fromOllama: (ollama: any, model?: string, tool_call_protocol?: string) => ({ agentName, messages: rawMessages, mode, tools, clientId, }: ICompletionArgs) => Promise<any>;
}
/**
 * An instance of AdapterUtils.
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

export { Adapter, type EventSource, ExecutionContextService, History, HistoryAdapter, HistoryMemoryInstance, HistoryPersistInstance, type IAgentSchema, type IAgentTool, type IBaseEvent, type IBusEvent, type IBusEventContext, type ICompletionArgs, type ICompletionSchema, type ICustomEvent, type IEmbeddingSchema, type IHistoryAdapter, type IHistoryInstance, type IHistoryInstanceCallbacks, type IIncomingMessage, type ILoggerAdapter, type ILoggerInstance, type ILoggerInstanceCallbacks, type IMakeConnectionConfig, type IMakeDisposeParams, type IModelMessage, type IOutgoingMessage, type IPolicySchema, type ISessionConfig, type IStateSchema, type IStorageSchema, type ISwarmSchema, type ITool, type IToolCall, Logger, LoggerAdapter, LoggerInstance, MethodContextService, PersistState, PersistStorage, PersistSwarm, Policy, type ReceiveMessageFn, Schema, type SendMessageFn$1 as SendMessageFn, SharedState, SharedStorage, State, Storage, addAgent, addCompletion, addEmbedding, addPolicy, addState, addStorage, addSwarm, addTool, beginContext, cancelOutput, cancelOutputForce, changeToAgent, changeToDefaultAgent, changeToPrevAgent, commitAssistantMessage, commitAssistantMessageForce, commitFlush, commitFlushForce, commitStopTools, commitStopToolsForce, commitSystemMessage, commitSystemMessageForce, commitToolOutput, commitToolOutputForce, commitUserMessage, commitUserMessageForce, complete, disposeConnection, dumpAgent, dumpClientPerformance, dumpDocs, dumpPerfomance, dumpSwarm, emit, emitForce, event, execute, executeForce, getAgentHistory, getAgentName, getAssistantHistory, getLastAssistantMessage, getLastSystemMessage, getLastUserMessage, getRawHistory, getSessionContext, getSessionMode, getUserHistory, listenAgentEvent, listenAgentEventOnce, listenEvent, listenEventOnce, listenExecutionEvent, listenExecutionEventOnce, listenHistoryEvent, listenHistoryEventOnce, listenPolicyEvent, listenPolicyEventOnce, listenSessionEvent, listenSessionEventOnce, listenStateEvent, listenStateEventOnce, listenStorageEvent, listenStorageEventOnce, listenSwarmEvent, listenSwarmEventOnce, makeAutoDispose, makeConnection, runStateless, runStatelessForce, session, setConfig, swarm };
