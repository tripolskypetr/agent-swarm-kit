import * as di_scoped from 'di-scoped';
import * as functools_kit from 'functools-kit';
import { SortedArray, Subject } from 'functools-kit';
import { IHistoryAdapter as IHistoryAdapter$1 } from 'src/classes/History';

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
    log(...args: any[]): void;
    /**
     * Logs a debug message.
     * @param {...any[]} args - The debug message or messages to log.
     */
    debug(...args: any[]): void;
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
}>, ISwarmCallbacks {
    /** Client identifier */
    clientId: string;
    /** Logger instance */
    logger: ILogger;
    /** Map of agent names to agent instances */
    agentMap: Record<AgentName, IAgent>;
}
/**
 * Schema for defining a swarm.
 * @interface
 */
interface ISwarmSchema {
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
type SendMessageFn$1 = (outgoing: IOutgoingMessage) => Promise<void> | void;
/**
 * Function type for receiving messages.
 * @typedef {function} ReceiveMessageFn
 * @param {IIncomingMessage} incoming - The incoming message.
 * @returns {Promise<void> | void}
 */
type ReceiveMessageFn = (incoming: IIncomingMessage) => Promise<void> | void;
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
    connect(connector: SendMessageFn$1): ReceiveMessageFn;
    /**
     * Commit tool output.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param {string} content - The content to commit.
     * @returns {Promise<void>}
     */
    commitToolOutput(toolId: string, content: string): Promise<void>;
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
 * Interface for History Adapter Callbacks
 */
interface IHistoryInstanceCallbacks {
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
    onRef: (history: HistoryInstance) => void;
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
     * Dispose of the history for a given agent.
     * @param agentName - The agent name or null.
     * @returns A promise that resolves when the history is disposed.
     */
    dispose(agentName: AgentName | null): Promise<void>;
}
/**
 * Type for History Instance Constructor
 */
type THistoryInstanceCtor = new (clientId: string, ...args: unknown[]) => IHistoryInstance;
/**
 * Class representing a History Instance
 */
declare class HistoryInstance implements IHistoryInstance {
    readonly clientId: string;
    readonly callbacks: Partial<IHistoryInstanceCallbacks>;
    private _array;
    /**
     * Wait for the history to initialize.
     * @param agentName - The agent name.
     */
    waitForInit: ((agentName: AgentName) => Promise<void>) & functools_kit.ISingleshotClearable;
    /**
     * Create a HistoryInstance.
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
    push: (value: IModelMessage, agentName: AgentName) => Promise<void>;
    /**
     * Dispose of the history for a given agent.
     * @param agentName - The agent name or null.
     * @returns A promise that resolves when the history is disposed.
     */
    dispose: (agentName: AgentName | null) => Promise<void>;
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

type Embeddings = number[];
interface IEmbeddingCallbacks {
    onCreate(text: string, embeddings: Embeddings, clientId: string, embeddingName: EmbeddingName): void;
    onCompare(text1: string, text2: string, similarity: number, clientId: string, embeddingName: EmbeddingName): void;
}
interface IEmbeddingSchema {
    embeddingName: EmbeddingName;
    createEmbedding(text: string): Promise<Embeddings>;
    calculateSimilarity(a: Embeddings, b: Embeddings): Promise<number>;
    callbacks?: Partial<IEmbeddingCallbacks>;
}
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
    /**
     * Function to get data from the storage.
     * @param clientId - The client ID.
     * @param storageName - The name of the storage.
     * @returns A promise that resolves to an array of storage data or an array of storage data.
     */
    getData?: (clientId: string, storageName: StorageName) => Promise<T[]> | T[];
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

/**
 * Interface representing lifecycle callbacks of a tool
 * @template T - The type of the parameters for the tool.
 */
interface IAgentToolCallbacks<T = Record<string, unknown>> {
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
interface IAgentTool<T = Record<string, unknown>> extends ITool {
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
     * Clears the history for the agent.
     * @returns A promise that resolves when the flush is committed.
     */
    commitFlush(): Promise<void>;
    /**
     * Unlock the queue on agent change. Stop the next tool execution
     * @returns A promise that resolves when the agent change is committed.
     */
    commitAgentChange(): Promise<void>;
}
/** Type representing the name of an agent. */
type AgentName = string;
/** Type representing the name of a tool. */
type ToolName = string;

/**
 * Interface representing the context.
 */
interface IContext {
    clientId: string;
    agentName: AgentName;
    swarmName: SwarmName;
    storageName: StorageName;
}
/**
 * Service providing context information.
 */
declare const ContextService: (new () => {
    readonly context: IContext;
}) & Omit<{
    new (context: IContext): {
        readonly context: IContext;
    };
}, "prototype"> & di_scoped.IScopedClassRun<[context: IContext]>;

/**
 * LoggerService class that implements the ILogger interface.
 * Provides methods to log and debug messages.
 */
declare class LoggerService implements ILogger {
    private _logger;
    /**
     * Logs messages using the current logger.
     * @param {...any} args - The messages to log.
     */
    log: (...args: any[]) => void;
    /**
     * Logs debug messages using the current logger.
     * @param {...any} args - The debug messages to log.
     */
    debug: (...args: any[]) => void;
    /**
     * Sets a new logger.
     * @param {ILogger} logger - The new logger to set.
     */
    setLogger: (logger: ILogger) => void;
}

declare const AGENT_CHANGE_SYMBOL: unique symbol;
/**
 * Represents a client agent that interacts with the system.
 * @implements {IAgent}
 */
declare class ClientAgent implements IAgent {
    readonly params: IAgentParams;
    readonly _agentChangeSubject: Subject<typeof AGENT_CHANGE_SYMBOL>;
    readonly _toolCommitSubject: Subject<void>;
    readonly _toolErrorSubject: Subject<void>;
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
    _emitOuput: (mode: ExecutionMode, rawResult: string) => Promise<void>;
    /**
     * Resurrects the model based on the given reason.
     * @param {string} [reason] - The reason for resurrecting the model.
     * @returns {Promise<string>}
     * @private
     */
    _resurrectModel: (mode: ExecutionMode, reason?: string) => Promise<string>;
    /**
     * Waits for the output to be available.
     * @returns {Promise<string>}
     */
    waitForOutput: () => Promise<string>;
    /**
     * Gets the completion message from the model.
     * @returns {Promise<IModelMessage>}
     */
    getCompletion: (mode: ExecutionMode) => Promise<IModelMessage>;
    /**
     * Commits a user message to the history without answer.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>}
     */
    commitUserMessage: (message: string) => Promise<void>;
    /**
     * Commits flush of agent history
     * @returns {Promise<void>}
     */
    commitFlush: () => Promise<void>;
    /**
     * Commits change of agent to prevent the next tool execution from being called.
     * @returns {Promise<void>}
     */
    commitAgentChange: () => Promise<void>;
    /**
     * Commits a system message to the history.
     * @param {string} message - The system message to commit.
     * @returns {Promise<void>}
     */
    commitSystemMessage: (message: string) => Promise<void>;
    /**
     * Commits the tool output to the history.
     * @param {string} content - The tool output content.
     * @returns {Promise<void>}
     */
    commitToolOutput: (toolId: string, content: string) => Promise<void>;
    /**
     * Executes the incoming message and processes tool calls if any.
     * @param {string} incoming - The incoming message content.
     * @returns {Promise<void>}
     */
    execute: IAgent["execute"];
    /**
     * Should call on agent dispose
     * @returns {Promise<void>}
     */
    dispose: () => Promise<void>;
}

/**
 * Service for managing agent connections.
 * @implements {IAgent}
 */
declare class AgentConnectionService implements IAgent {
    private readonly loggerService;
    private readonly contextService;
    private readonly sessionValidationService;
    private readonly historyConnectionService;
    private readonly storageConnectionService;
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
     * Commits a system message.
     * @param {string} message - The system message.
     * @returns {Promise<any>} The commit result.
     */
    commitSystemMessage: (message: string) => Promise<void>;
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
    push: (message: IModelMessage) => Promise<void>;
    /**
     * Converts the history to an array of raw messages.
     * @returns {Promise<IModelMessage[]>} - The array of raw messages.
     */
    toArrayForRaw: () => Promise<IModelMessage[]>;
    /**
     * Converts the history to an array of messages for the agent.
     * @param {string} prompt - The prompt message.
     * @param {string} system - The tool calling protocol
     * @returns {Promise<IModelMessage[]>} - The array of messages for the agent.
     */
    toArrayForAgent: (prompt: string, system?: string[]) => Promise<IModelMessage[]>;
    /**
     * Should call on agent dispose
     * @returns {Promise<void>}
     */
    dispose: () => Promise<void>;
}

/**
 * Service for managing history connections.
 * @implements {IHistory}
 */
declare class HistoryConnectionService implements IHistory {
    private readonly loggerService;
    private readonly contextService;
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

/**
 * ClientSwarm class implements the ISwarm interface and manages agents within a swarm.
 */
declare class ClientSwarm implements ISwarm {
    readonly params: ISwarmParams;
    private _agentChangedSubject;
    private _activeAgent;
    get _agentList(): [string, IAgent][];
    /**
     * Creates an instance of ClientSwarm.
     * @param {ISwarmParams} params - The parameters for the swarm.
     */
    constructor(params: ISwarmParams);
    /**
     * Waits for output from the active agent.
     * @returns {Promise<string>} - The output from the active agent.
     * @throws {Error} - If the timeout is reached.
     */
    waitForOutput: () => Promise<string>;
    /**
     * Gets the name of the active agent.
     * @returns {Promise<AgentName>} - The name of the active agent.
     */
    getAgentName: () => Promise<AgentName>;
    /**
     * Gets the active agent.
     * @returns {Promise<IAgent>} - The active agent.
     */
    getAgent: () => Promise<IAgent>;
    /**
     * Sets the reference of an agent in the swarm.
     * @param {AgentName} agentName - The name of the agent.
     * @param {IAgent} agent - The agent instance.
     * @throws {Error} - If the agent is not in the swarm.
     */
    setAgentRef: (agentName: AgentName, agent: IAgent) => Promise<void>;
    /**
     * Sets the active agent by name.
     * @param {AgentName} agentName - The name of the agent to set as active.
     */
    setAgentName: (agentName: AgentName) => Promise<void>;
}

/**
 * Service for managing swarm connections.
 * @implements {ISwarm}
 */
declare class SwarmConnectionService implements ISwarm {
    private readonly loggerService;
    private readonly contextService;
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
    emit: (message: string) => Promise<void>;
    /**
     * Executes a message and optionally emits the output.
     * @param {string} message - The message to execute.
     * @param {boolean} [noEmit=false] - Whether to emit the output or not.
     * @returns {Promise<string>} - The output of the execution.
     */
    execute: (message: string, mode: ExecutionMode) => Promise<string>;
    /**
     * Commits tool output.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param {string} content - The content to commit.
     * @returns {Promise<void>}
     */
    commitToolOutput: (toolId: string, content: string) => Promise<void>;
    /**
     * Commits user message without answer.
     * @param {string} message - The message to commit.
     * @returns {Promise<void>}
     */
    commitUserMessage: (message: string) => Promise<void>;
    /**
     * Commits flush of agent history
     * @returns {Promise<void>}
     */
    commitFlush: () => Promise<void>;
    /**
     * Commits a system message.
     * @param {string} message - The system message to commit.
     * @returns {Promise<void>}
     */
    commitSystemMessage: (message: string) => Promise<void>;
    /**
     * Connects the session to a connector function.
     * @param {SendMessageFn} connector - The connector function.
     * @returns {ReceiveMessageFn} - The function to receive messages.
     */
    connect: (connector: SendMessageFn$1) => ReceiveMessageFn;
    /**
     * Should call on session dispose
     * @returns {Promise<void>}
     */
    dispose: () => Promise<void>;
}

/**
 * Service for managing session connections.
 * @implements {ISession}
 */
declare class SessionConnectionService implements ISession {
    private readonly loggerService;
    private readonly contextService;
    private readonly swarmConnectionService;
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
     * Connects to the session using the provided connector.
     * @param {SendMessageFn} connector - The function to send messages.
     * @returns {ReceiveMessageFn} The function to receive messages.
     */
    connect: (connector: SendMessageFn$1) => ReceiveMessageFn;
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
     * Disposes of the session connection service.
     * @returns {Promise<void>} A promise that resolves when the service is disposed.
     */
    dispose: () => Promise<void>;
}

interface IAgentConnectionService extends AgentConnectionService {
}
type InternalKeys$4 = keyof {
    getAgent: never;
};
type TAgentConnectionService = {
    [key in Exclude<keyof IAgentConnectionService, InternalKeys$4>]: unknown;
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
    createAgentRef: (clientId: string, agentName: AgentName) => Promise<ClientAgent>;
    /**
     * Executes a command on the agent.
     * @param {string} input - The input command.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The execution result.
     */
    execute: (input: string, mode: ExecutionMode, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Waits for the agent's output.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The output result.
     */
    waitForOutput: (clientId: string, agentName: AgentName) => Promise<string>;
    /**
     * Commits tool output to the agent.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param {string} content - The content to commit.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitToolOutput: (toolId: string, content: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits a system message to the agent.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitSystemMessage: (message: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits user message to the agent without answer.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitUserMessage: (message: string, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits flush of agent history
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitFlush: (clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Commits change of agent to prevent the next tool execution from being called.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The commit result.
     */
    commitAgentChange: (clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Disposes of the agent.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The name of the agent.
     * @returns {Promise<unknown>} The dispose result.
     */
    dispose: (clientId: string, agentName: AgentName) => Promise<void>;
}

interface IHistoryConnectionService extends HistoryConnectionService {
}
type InternalKeys$3 = keyof {
    getHistory: never;
    getItems: never;
};
type THistoryConnectionService = {
    [key in Exclude<keyof IHistoryConnectionService, InternalKeys$3>]: unknown;
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
    push: (message: IModelMessage, clientId: string, agentName: AgentName) => Promise<void>;
    /**
     * Converts history to an array for a specific agent.
     * @param {string} prompt - The prompt.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @returns {Promise<any[]>} A promise that resolves to an array of history items.
     */
    toArrayForAgent: (prompt: string, clientId: string, agentName: AgentName) => Promise<IModelMessage[]>;
    /**
     * Converts history to a raw array.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @returns {Promise<any[]>} A promise that resolves to a raw array of history items.
     */
    toArrayForRaw: (clientId: string, agentName: AgentName) => Promise<IModelMessage[]>;
    /**
     * Disposes of the history.
     * @param {string} clientId - The client ID.
     * @param {AgentName} agentName - The agent name.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    dispose: (clientId: string, agentName: AgentName) => Promise<void>;
}

interface ISessionConnectionService extends SessionConnectionService {
}
type InternalKeys$2 = keyof {
    getSession: never;
};
type TSessionConnectionService = {
    [key in Exclude<keyof ISessionConnectionService, InternalKeys$2>]: unknown;
};
/**
 * Service for managing public session interactions.
 */
declare class SessionPublicService implements TSessionConnectionService {
    private readonly loggerService;
    private readonly sessionConnectionService;
    /**
     * Emits a message to the session.
     * @param {string} content - The content to emit.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    emit: (content: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Executes a command in the session.
     * @param {string} content - The content to execute.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    execute: (content: string, mode: ExecutionMode, clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Connects to the session.
     * @param {SendMessageFn} connector - The function to send messages.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {ReceiveMessageFn}
     */
    connect: (connector: SendMessageFn$1, clientId: string, swarmName: SwarmName) => ReceiveMessageFn;
    /**
     * Commits tool output to the session.
     * @param {string} toolId - The `tool_call_id` for openai history
     * @param {string} content - The content to commit.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    commitToolOutput: (toolId: string, content: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits a system message to the session.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    commitSystemMessage: (message: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits user message to the agent without answer.
     * @param {string} message - The message to commit.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    commitUserMessage: (message: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Commits flush of agent history
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    commitFlush: (clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Disposes of the session.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    dispose: (clientId: string, swarmName: SwarmName) => Promise<void>;
}

interface ISwarmConnectionService extends SwarmConnectionService {
}
type InternalKeys$1 = keyof {
    getSwarm: never;
};
type TSwarmConnectionService = {
    [key in Exclude<keyof ISwarmConnectionService, InternalKeys$1>]: unknown;
};
/**
 * Service for managing public swarm interactions.
 */
declare class SwarmPublicService implements TSwarmConnectionService {
    private readonly loggerService;
    private readonly swarmConnectionService;
    /**
     * Waits for output from the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    waitForOutput: (clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Gets the agent name from the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<string>}
     */
    getAgentName: (clientId: string, swarmName: SwarmName) => Promise<string>;
    /**
     * Gets the agent from the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<IAgent>}
     */
    getAgent: (clientId: string, swarmName: SwarmName) => Promise<IAgent>;
    /**
     * Sets the agent reference in the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @param {AgentName} agentName - The agent name.
     * @param {IAgent} agent - The agent instance.
     * @returns {Promise<void>}
     */
    setAgentRef: (clientId: string, swarmName: SwarmName, agentName: AgentName, agent: IAgent) => Promise<void>;
    /**
     * Sets the agent name in the swarm.
     * @param {AgentName} agentName - The agent name.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    setAgentName: (agentName: AgentName, clientId: string, swarmName: SwarmName) => Promise<void>;
    /**
     * Disposes of the swarm.
     * @param {string} clientId - The client ID.
     * @param {SwarmName} swarmName - The swarm name.
     * @returns {Promise<void>}
     */
    dispose: (clientId: string, swarmName: SwarmName) => Promise<void>;
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
    /**
     * Retrieves the storages used by the agent
     * @param {agentName} agentName - The name of the swarm.
     * @returns {string[]} The list of storage names.
     * @throws Will throw an error if the swarm is not found.
     */
    getStorageList: (agentName: string) => string[];
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
    validate: (clientId: SessionId, source: string) => void;
    /**
     * Removes a session.
     * @param {SessionId} clientId - The ID of the client.
     */
    removeSession: (clientId: SessionId) => void;
}

/**
 * Service for validating swarms and their agents.
 */
declare class SwarmValidationService {
    private readonly loggerService;
    private readonly agentValidationService;
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
    private _itemMap;
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
    take: (search: string, total: number, score?: number) => Promise<T[]>;
    /**
     * Upserts an item into the storage.
     * @param {T} item - The item to upsert.
     * @returns {Promise<void>}
     */
    upsert: (item: T) => Promise<void>;
    /**
     * Removes an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @returns {Promise<void>}
     */
    remove: (itemId: IStorageData["id"]) => Promise<void>;
    /**
     * Clears all items from the storage.
     * @returns {Promise<void>}
     */
    clear: () => Promise<void>;
    /**
     * Gets an item by its ID.
     * @param {IStorageData["id"]} itemId - The ID of the item to get.
     * @returns {Promise<T | null>} - The item or null if not found.
     */
    get: (itemId: IStorageData["id"]) => Promise<T | null>;
    /**
     * Lists all items in the storage, optionally filtered by a predicate.
     * @param {(item: T) => boolean} [filter] - The filter predicate.
     * @returns {Promise<T[]>} - The list of items.
     */
    list: (filter?: (item: T) => boolean) => Promise<T[]>;
}

/**
 * Service for managing storage connections.
 * @implements {IStorage}
 */
declare class StorageConnectionService implements IStorage {
    private readonly loggerService;
    private readonly contextService;
    private readonly storageSchemaService;
    private readonly sessionValidationService;
    private readonly embeddingSchemaService;
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
type InternalKeys = keyof {
    getStorage: never;
};
type TStorageConnectionService = {
    [key in Exclude<keyof IStorageConnectionService, InternalKeys>]: unknown;
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
    take: (search: string, total: number, clientId: string, storageName: StorageName, score?: number) => Promise<IStorageData[]>;
    /**
     * Upserts an item in the storage.
     * @param {IStorageData} item - The item to upsert.
     * @returns {Promise<void>}
     */
    upsert: (item: IStorageData, clientId: string, storageName: StorageName) => Promise<void>;
    /**
     * Removes an item from the storage.
     * @param {IStorageData["id"]} itemId - The ID of the item to remove.
     * @returns {Promise<void>}
     */
    remove: (itemId: IStorageData["id"], clientId: string, storageName: StorageName) => Promise<void>;
    /**
     * Retrieves an item from the storage by its ID.
     * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
     * @returns {Promise<IStorageData>} The retrieved item.
     */
    get: (itemId: IStorageData["id"], clientId: string, storageName: StorageName) => Promise<IStorageData | null>;
    /**
     * Retrieves a list of items from the storage, optionally filtered by a predicate function.
     * @param {function(IStorageData): boolean} [filter] - The optional filter function.
     * @returns {Promise<IStorageData[]>} The list of items.
     */
    list: (clientId: string, storageName: StorageName, filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>;
    /**
     * Clears all items from the storage.
     * @returns {Promise<void>}
     */
    clear: (clientId: string, storageName: StorageName) => Promise<void>;
    /**
     * Disposes of the storage.
     * @param {string} clientId - The client ID.
     * @param {StorageName} storageName - The storage name.
     * @returns {Promise<void>}
     */
    dispose: (clientId: string, storageName: StorageName) => Promise<void>;
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

declare const swarm: {
    agentValidationService: AgentValidationService;
    toolValidationService: ToolValidationService;
    sessionValidationService: SessionValidationService;
    swarmValidationService: SwarmValidationService;
    completionValidationService: CompletionValidationService;
    storageValidationService: StorageValidationService;
    embeddingValidationService: EmbeddingValidationService;
    agentPublicService: AgentPublicService;
    historyPublicService: HistoryPublicService;
    sessionPublicService: SessionPublicService;
    swarmPublicService: SwarmPublicService;
    storagePublicService: StoragePublicService;
    agentSchemaService: AgentSchemaService;
    toolSchemaService: ToolSchemaService;
    swarmSchemaService: SwarmSchemaService;
    completionSchemaService: CompletionSchemaService;
    embeddingSchemaService: EmbeddingSchemaService;
    storageSchemaService: StorageSchemaService;
    agentConnectionService: AgentConnectionService;
    historyConnectionService: HistoryConnectionService;
    swarmConnectionService: SwarmConnectionService;
    sessionConnectionService: SessionConnectionService;
    storageConnectionService: StorageConnectionService;
    loggerService: LoggerService;
    contextService: {
        readonly context: IContext;
    };
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
declare const addTool: (toolSchema: IAgentTool) => string;

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
    scheduled(connector: ReceiveMessageFn, clientId: string, swarmName: SwarmName, { delay, }?: Partial<IMakeConnectionConfig>): (content: string) => Promise<void>;
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
 * Changes the agent for a given client session in swarm.
 * @async
 * @function
 * @param {AgentName} agentName - The name of the agent.
 * @param {string} clientId - The client ID.
 * @returns {Promise<void>} - A promise that resolves when the agent is changed.
 */
declare const changeAgent: (agentName: AgentName, clientId: string) => Promise<void>;

/**
 * The complete function will create a swarm, execute single command and dispose it
 * Best for developer needs like troubleshooting tool execution
 *
 * @param {string} content - The content to process.
 * @param {string} clientId - The client ID.
 * @param {SwarmName} swarmName - The swarm name.
 * @returns {Promise<string>} The result of the complete function.
 */
declare const complete: (content: string, clientId: string, swarmName: SwarmName) => Promise<string>;

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
    scheduled(clientId: string, swarmName: SwarmName, { delay, }?: Partial<ISessionConfig>): {
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
declare const disposeConnection: (clientId: string, swarmName: SwarmName) => Promise<void>;

/**
 * Retrieves the raw history as it is for a given client ID without any modifications.
 *
 * @param {string} clientId - The ID of the client whose history is to be retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array containing the raw history.
 */
declare const getRawHistory: (clientId: string) => Promise<IModelMessage[]>;

/**
 * Retrieves the history prepared for a specific agent with resque algorithm tweaks
 *
 * @param {string} clientId - The ID of the client.
 * @param {AgentName} agentName - The name of the agent.
 * @returns {Promise<Array>} - A promise that resolves to an array containing the agent's history.
 */
declare const getAgentHistory: (clientId: string, agentName: AgentName) => Promise<IModelMessage[]>;

/**
 * Return the session mode (`"session" | "makeConnection" | "complete"`) for clientId
 *
 * @param {string} clientId - The client ID of the session.
 */
declare const getSessionMode: (clientId: string) => Promise<SessionMode>;

/**
 * Commits the tool output to the active agent in a swarm session
 *
 * @param {string} content - The content to be committed.
 * @param {string} clientId - The client ID associated with the session.
 * @param {AgentName} agentName - The name of the agent committing the output.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
declare const commitToolOutput: (toolId: string, content: string, clientId: string, agentName: AgentName) => Promise<void>;

/**
 * Commits a system message to the active agent in as swarm.
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
 * Send the message to the active agent in the swarm content like it income from client side
 * Should be used to review tool output and initiate conversation from the model side to client
 *
 * @param {string} content - The content to be executed.
 * @param {string} clientId - The ID of the client requesting execution.
 * @param {AgentName} agentName - The name of the agent executing the command.
 * @returns {Promise<void>} - A promise that resolves when the execution is complete.
 */
declare const execute: (content: string, clientId: string, agentName: AgentName) => Promise<string>;

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
declare const emit: (content: string, clientId: string, agentName: AgentName) => Promise<void>;

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
 * Retrieves the last message sent by the user from the client's message history.
 *
 * @param {string} clientId - The ID of the client whose message history is being retrieved.
 * @returns {Promise<string | null>} - The content of the last user message, or null if no user message is found.
 */
declare const getLastUserMessage: (clientId: string) => Promise<string>;

/**
 * Retrieves the agent name for a given client ID.
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<string>} The name of the agent.
 * @throws Will throw an error if the client ID is invalid or if the swarm validation fails.
 */
declare const getAgentName: (clientId: string) => Promise<string>;

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
declare const makeAutoDispose: (clientId: string, swarmName: SwarmName, { timeoutSeconds, onDestroy }?: Partial<IMakeDisposeParams>) => {
    /**
     * Signals that the client is active, resetting the auto-dispose timer.
     */
    tick(): void;
    /**
     * Stops the auto-dispose mechanism.
     */
    destroy(): void;
};

declare const GLOBAL_CONFIG: {
    CC_TOOL_CALL_EXCEPTION_PROMPT: string;
    CC_EMPTY_OUTPUT_PLACEHOLDERS: string[];
    CC_KEEP_MESSAGES: number;
    CC_GET_AGENT_HISTORY_ADAPTER: (clientId: string, agentName: AgentName) => IHistoryAdapter$1;
    CC_SWARM_AGENT_CHANGED: (clientId: string, agentName: AgentName, swarmName: SwarmName) => Promise<void>;
    CC_SWARM_DEFAULT_AGENT: (clientId: string, swarmName: SwarmName, defaultAgent: AgentName) => Promise<AgentName>;
    CC_AGENT_DEFAULT_VALIDATION: (output: string) => Promise<string | null>;
    CC_AGENT_HISTORY_FILTER: (agentName: AgentName) => (message: IModelMessage) => boolean;
    CC_AGENT_OUTPUT_TRANSFORM: (input: string) => string;
    CC_AGENT_OUTPUT_MAP: (message: IModelMessage) => IModelMessage | Promise<IModelMessage>;
    CC_AGENT_SYSTEM_PROMPT: string[];
    CC_AGENT_DISALLOWED_TAGS: string[];
    CC_AGENT_DISALLOWED_SYMBOLS: string[];
    CC_STORAGE_SEARCH_SIMILARITY: number;
    CC_STORAGE_SEARCH_POOL: number;
};
declare const setConfig: (config: Partial<typeof GLOBAL_CONFIG>) => void;

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

export { ContextService, History, type IAgentSchema, type IAgentTool, type ICompletionArgs, type ICompletionSchema, type IEmbeddingSchema, type IHistoryAdapter, type IHistoryInstance, type IHistoryInstanceCallbacks, type IIncomingMessage, type IMakeConnectionConfig, type IMakeDisposeParams, type IModelMessage, type IOutgoingMessage, type ISessionConfig, type IStorageSchema, type ISwarmSchema, type ITool, type IToolCall, type ReceiveMessageFn, type SendMessageFn$1 as SendMessageFn, Storage, HistoryAdapter as _HistoryAdapter, HistoryInstance as _HistoryInstance, addAgent, addCompletion, addEmbedding, addStorage, addSwarm, addTool, changeAgent, commitFlush, commitFlushForce, commitSystemMessage, commitSystemMessageForce, commitToolOutput, commitToolOutputForce, commitUserMessage, commitUserMessageForce, complete, disposeConnection, emit, emitForce, execute, executeForce, getAgentHistory, getAgentName, getAssistantHistory, getLastAssistantMessage, getLastSystemMessage, getLastUserMessage, getRawHistory, getSessionMode, getUserHistory, makeAutoDispose, makeConnection, session, setConfig, swarm };
