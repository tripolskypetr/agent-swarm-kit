import * as di_scoped from 'di-scoped';
import * as functools_kit from 'functools-kit';
import { IPubsubArray, Subject } from 'functools-kit';
import { AgentName as AgentName$1 } from 'src/interfaces/Agent.interface';

interface IModelMessage {
    role: 'assistant' | 'system' | 'tool' | 'user' | 'resque';
    agentName: string;
    content: string;
    tool_calls?: {
        function: {
            name: string;
            arguments: {
                [key: string]: any;
            };
        };
    }[];
}

interface ILogger {
    log(...args: any[]): void;
    debug(...args: any[]): void;
}

interface IHistory {
    push(message: IModelMessage): Promise<void>;
    toArrayForAgent(prompt: string): Promise<IModelMessage[]>;
    toArrayForRaw(): Promise<IModelMessage[]>;
}
interface IHistoryParams extends IHistorySchema {
    agentName: AgentName;
    clientId: string;
    logger: ILogger;
}
interface IHistorySchema {
    items: IPubsubArray<IModelMessage>;
}

interface ITool {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            required: string[];
            properties: {
                [key: string]: {
                    type: string;
                    description: string;
                    enum?: string[];
                };
            };
        };
    };
}

interface ICompletion extends ICompletionSchema {
}
interface ICompletionArgs {
    clientId: string;
    agentName: AgentName;
    messages: IModelMessage[];
    tools?: ITool[];
}
interface ICompletionSchema {
    completionName: CompletionName;
    getCompletion(args: ICompletionArgs): Promise<IModelMessage>;
}
type CompletionName = string;

interface IAgentTool<T = Record<string, unknown>> extends ITool {
    toolName: ToolName;
    call(clientId: string, agentName: AgentName, params: T): Promise<void>;
    validate(clientId: string, agentName: AgentName, params: T): Promise<boolean> | boolean;
}
interface IAgentParams extends Omit<IAgentSchema, keyof {
    tools: never;
    completion: never;
    validate: never;
}> {
    clientId: string;
    logger: ILogger;
    history: IHistory;
    completion: ICompletion;
    tools?: IAgentTool[];
    validate: (output: string) => Promise<string | null>;
}
interface IAgentSchema {
    agentName: AgentName;
    completion: CompletionName;
    prompt: string;
    tools?: ToolName[];
    validate?: (output: string) => Promise<string | null>;
}
interface IAgent {
    execute: (input: string) => Promise<void>;
    waitForOutput: () => Promise<string>;
    commitToolOutput(content: string): Promise<void>;
    commitSystemMessage(message: string): Promise<void>;
}
type AgentName = string;
type ToolName = string;

interface ISwarmParams extends Omit<ISwarmSchema, keyof {
    agentList: never;
}> {
    clientId: string;
    logger: ILogger;
    agentMap: Record<AgentName, IAgent>;
}
interface ISwarmSchema {
    defaultAgent: AgentName;
    swarmName: string;
    agentList: string[];
}
interface ISwarm {
    waitForOutput(): Promise<string>;
    getAgentName(): Promise<AgentName>;
    getAgent(): Promise<IAgent>;
    setAgentName(agentName: AgentName): Promise<void>;
}
type SwarmName = string;

interface IContext {
    clientId: string;
    agentName: AgentName;
    swarmName: SwarmName;
}
declare const ContextService: (new () => {
    readonly context: IContext;
}) & Omit<{
    new (context: IContext): {
        readonly context: IContext;
    };
}, "prototype"> & di_scoped.IScopedClassRun<[context: IContext]>;

declare class LoggerService implements ILogger {
    private _logger;
    log: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    setLogger: (logger: ILogger) => void;
}

declare class ClientAgent implements IAgent {
    readonly params: IAgentParams;
    readonly _toolCommitSubject: Subject<void>;
    readonly _outputSubject: Subject<string>;
    constructor(params: IAgentParams);
    _emitOuput: (result: string) => Promise<void>;
    _resurrectModel: (reason?: string) => Promise<string>;
    waitForOutput: () => Promise<string>;
    getCompletion: () => Promise<IModelMessage>;
    commitSystemMessage: (message: string) => Promise<void>;
    commitToolOutput: (content: string) => Promise<void>;
    execute: IAgent["execute"];
}

declare class AgentConnectionService implements IAgent {
    private readonly loggerService;
    private readonly contextService;
    private readonly sessionValidationService;
    private readonly historyConnectionService;
    private readonly agentSchemaService;
    private readonly toolSchemaService;
    private readonly completionSchemaService;
    getAgent: ((clientId: string, agentName: string) => ClientAgent) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientAgent>;
    execute: (input: string) => Promise<void>;
    waitForOutput: () => Promise<string>;
    commitToolOutput: (content: string) => Promise<void>;
    commitSystemMessage: (message: string) => Promise<void>;
    dispose: () => Promise<void>;
}

declare class ClientHistory implements IHistory {
    readonly params: IHistoryParams;
    constructor(params: IHistoryParams);
    push: (message: IModelMessage) => Promise<void>;
    toArrayForRaw: () => Promise<IModelMessage[]>;
    toArrayForAgent: (prompt: string) => Promise<IModelMessage[]>;
}

declare class HistoryConnectionService implements IHistory {
    private readonly loggerService;
    private readonly contextService;
    getItems: ((clientId: string) => IPubsubArray<IModelMessage>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, IPubsubArray<IModelMessage>>;
    getHistory: ((clientId: string, agentName: string) => ClientHistory) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientHistory>;
    push: (message: IModelMessage) => Promise<void>;
    toArrayForAgent: (prompt: string) => Promise<IModelMessage[]>;
    toArrayForRaw: () => Promise<IModelMessage[]>;
    dispose: () => Promise<void>;
}

declare class AgentSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: AgentName, value: IAgentSchema) => void;
    get: (key: AgentName) => IAgentSchema;
}

declare class ToolSchemaService {
    private readonly loggerService;
    private registry;
    register: (key: ToolName, value: IAgentTool) => void;
    get: (key: ToolName) => IAgentTool;
}

declare class ClientSwarm implements ISwarm {
    readonly params: ISwarmParams;
    private _activeAgent;
    constructor(params: ISwarmParams);
    waitForOutput: () => Promise<string>;
    getAgentName: () => Promise<AgentName>;
    getAgent: () => Promise<IAgent>;
    setAgentName: (agentName: AgentName) => Promise<void>;
}

declare class SwarmConnectionService implements ISwarm {
    private readonly loggerService;
    private readonly contextService;
    private readonly agentConnectionService;
    private readonly swarmSchemaService;
    getSwarm: ((clientId: string, swarmName: string) => ClientSwarm) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientSwarm>;
    waitForOutput: () => Promise<string>;
    getAgentName: () => Promise<string>;
    getAgent: () => Promise<IAgent>;
    setAgentName: (agentName: AgentName) => Promise<void>;
    dispose: () => Promise<void>;
}

declare class SwarmSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: SwarmName, value: ISwarmSchema) => void;
    get: (key: SwarmName) => ISwarmSchema;
}

declare class CompletionSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: string, value: ICompletionSchema) => void;
    get: (key: string) => ICompletionSchema;
}

interface IIncomingMessage {
    clientId: string;
    data: string;
    agentName: AgentName;
}
interface IOutgoingMessage {
    clientId: string;
    data: string;
    agentName: AgentName;
}

interface ISessionParams extends ISessionSchema {
    clientId: string;
    logger: ILogger;
    swarm: ISwarm;
}
interface ISessionSchema {
}
type SendMessageFn = (outgoing: IOutgoingMessage) => Promise<void> | void;
type ReceiveMessageFn = (incoming: IIncomingMessage) => Promise<void> | void;
interface ISession {
    execute(content: string): Promise<string>;
    connect(connector: SendMessageFn): ReceiveMessageFn;
    commitToolOutput(content: string): Promise<void>;
    commitSystemMessage(message: string): Promise<void>;
}
type SessionId = string;

declare class ClientSession implements ISession {
    readonly params: ISessionParams;
    constructor(params: ISessionParams);
    execute: (message: string) => Promise<string>;
    commitToolOutput: (content: string) => Promise<void>;
    commitSystemMessage: (message: string) => Promise<void>;
    connect: (connector: SendMessageFn) => ReceiveMessageFn;
}

declare class SessionConnectionService implements ISession {
    private readonly loggerService;
    private readonly contextService;
    private readonly swarmConnectionService;
    getSession: ((clientId: string, swarmName: string) => ClientSession) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientSession>;
    execute: (content: string) => Promise<string>;
    connect: (connector: SendMessageFn) => ReceiveMessageFn;
    commitToolOutput: (content: string) => Promise<void>;
    commitSystemMessage: (message: string) => Promise<void>;
    dispose: () => Promise<void>;
}

interface IAgentConnectionService extends AgentConnectionService {
}
type InternalKeys$3 = keyof {
    getAgent: never;
};
type TAgentConnectionService = {
    [key in Exclude<keyof IAgentConnectionService, InternalKeys$3>]: unknown;
};
declare class AgentPublicService implements TAgentConnectionService {
    private readonly loggerService;
    private readonly agentConnectionService;
    execute: (input: string, clientId: string, agentName: AgentName) => Promise<void>;
    waitForOutput: (clientId: string, agentName: AgentName) => Promise<string>;
    commitToolOutput: (content: string, clientId: string, agentName: AgentName) => Promise<void>;
    commitSystemMessage: (message: string, clientId: string, agentName: AgentName) => Promise<void>;
    dispose: (clientId: string, agentName: AgentName) => Promise<void>;
}

interface IHistoryConnectionService extends HistoryConnectionService {
}
type InternalKeys$2 = keyof {
    getHistory: never;
    getItems: never;
};
type THistoryConnectionService = {
    [key in Exclude<keyof IHistoryConnectionService, InternalKeys$2>]: unknown;
};
declare class HistoryPublicService implements THistoryConnectionService {
    private readonly loggerService;
    private readonly historyConnectionService;
    push: (message: IModelMessage, clientId: string, agentName: AgentName) => Promise<void>;
    toArrayForAgent: (prompt: string, clientId: string, agentName: AgentName) => Promise<IModelMessage[]>;
    toArrayForRaw: (clientId: string, agentName: AgentName) => Promise<IModelMessage[]>;
    dispose: (clientId: string, agentName: AgentName) => Promise<void>;
}

interface ISessionConnectionService extends SessionConnectionService {
}
type InternalKeys$1 = keyof {
    getSession: never;
};
type TSessionConnectionService = {
    [key in Exclude<keyof ISessionConnectionService, InternalKeys$1>]: unknown;
};
declare class SessionPublicService implements TSessionConnectionService {
    private readonly loggerService;
    private readonly sessionConnectionService;
    execute: (content: string, clientId: string, swarmName: SwarmName) => Promise<string>;
    connect: (connector: SendMessageFn, clientId: string, swarmName: SwarmName) => ReceiveMessageFn;
    commitToolOutput: (content: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    commitSystemMessage: (message: string, clientId: string, swarmName: SwarmName) => Promise<void>;
    dispose: (clientId: string, swarmName: SwarmName) => Promise<void>;
}

interface ISwarmConnectionService extends SwarmConnectionService {
}
type InternalKeys = keyof {
    getSwarm: never;
};
type TSwarmConnectionService = {
    [key in Exclude<keyof ISwarmConnectionService, InternalKeys>]: unknown;
};
declare class SwarmPublicService implements TSwarmConnectionService {
    private readonly loggerService;
    private readonly swarmConnectionService;
    waitForOutput: (clientId: string, swarmName: SwarmName) => Promise<string>;
    getAgentName: (clientId: string, swarmName: SwarmName) => Promise<string>;
    getAgent: (clientId: string, swarmName: SwarmName) => Promise<IAgent>;
    setAgentName: (agentName: AgentName, clientId: string, swarmName: SwarmName) => Promise<void>;
    dispose: (clientId: string, swarmName: SwarmName) => Promise<void>;
}

declare class AgentValidationService {
    private readonly loggerService;
    private readonly toolValidationService;
    private readonly completionValidationService;
    private _agentMap;
    addAgent: (agentName: AgentName, agentSchema: IAgentSchema) => void;
    validate: (agentName: AgentName, source: string) => void;
}

declare class ToolValidationService {
    private readonly loggerService;
    private _toolMap;
    addTool: (toolName: ToolName, toolSchema: IAgentTool) => void;
    validate: (toolName: ToolName, source: string) => void;
}

declare class SessionValidationService {
    private readonly loggerService;
    private _sessionSwarmMap;
    private _agentSwarmMap;
    addSession: (clientId: SessionId, swarmName: SwarmName) => void;
    addAgentUsage: (sessionId: SessionId, agentName: AgentName$1) => void;
    removeAgentUsage: (sessionId: SessionId, agentName: AgentName$1) => void;
    getSessionList: () => string[];
    getSessionAgentList: (clientId: string) => string[];
    getSwarm: (clientId: SessionId) => string;
    validate: (clientId: SessionId, source: string) => void;
    removeSession: (clientId: SessionId) => void;
}

declare class SwarmValidationService {
    private readonly loggerService;
    private readonly agentValidationService;
    private _swarmMap;
    addSwarm: (swarmName: SwarmName, swarmSchema: ISwarmSchema) => void;
    getAgentList: (swarmName: SwarmName) => string[];
    validate: (swarmName: SwarmName, source: string) => void;
}

declare class CompletionValidationService {
    private readonly loggerService;
    private _completionSet;
    addCompletion: (completionName: CompletionName) => void;
    validate: (completionName: CompletionName, source: string) => void;
}

declare const swarm: {
    agentValidationService: AgentValidationService;
    toolValidationService: ToolValidationService;
    sessionValidationService: SessionValidationService;
    swarmValidationService: SwarmValidationService;
    completionValidationService: CompletionValidationService;
    agentPublicService: AgentPublicService;
    historyPublicService: HistoryPublicService;
    sessionPublicService: SessionPublicService;
    swarmPublicService: SwarmPublicService;
    agentSchemaService: AgentSchemaService;
    toolSchemaService: ToolSchemaService;
    swarmSchemaService: SwarmSchemaService;
    completionSchemaService: CompletionSchemaService;
    agentConnectionService: AgentConnectionService;
    historyConnectionService: HistoryConnectionService;
    swarmConnectionService: SwarmConnectionService;
    sessionConnectionService: SessionConnectionService;
    loggerService: LoggerService;
    contextService: {
        readonly context: IContext;
    };
};

declare const addAgent: (agentSchema: IAgentSchema) => string;

declare const addCompletion: (completionSchema: ICompletionSchema) => string;

declare const addSwarm: (swarmSchema: ISwarmSchema) => string;

declare const addTool: (toolSchema: IAgentTool) => string;

declare const makeConnection: (connector: ReceiveMessageFn, clientId: string, swarmName: SwarmName) => SendMessageFn;

declare const changeAgent: (agentName: AgentName, clientId: string) => Promise<void>;

declare const complete: (content: string, clientId: string, swarmName: SwarmName) => Promise<string>;

type TComplete = (content: string) => Promise<string>;
declare const session: (clientId: string, swarmName: SwarmName) => {
    complete: TComplete;
    dispose: () => Promise<void>;
};

declare const disposeConnection: (clientId: string, swarmName: SwarmName) => Promise<void>;

declare const getRawHistory: (clientId: string) => Promise<IModelMessage[]>;

declare const getAgentHistory: (clientId: string, agentName: AgentName) => Promise<IModelMessage[]>;

declare const commitToolOutput: (content: string, clientId: string) => void;

declare const commitSystemMessage: (content: string, clientId: string) => void;

declare const execute: (content: string, clientId: string) => Promise<string>;

declare const GLOBAL_CONFIG: {
    CC_TOOL_CALL_EXCEPTION_PROMPT: string;
    CC_EMPTY_OUTPUT_PLACEHOLDERS: string[];
    CC_KEEP_MESSAGES: number;
    CC_ANSWER_TIMEOUT_SECONDS: number;
};
declare const setConfig: (config: typeof GLOBAL_CONFIG) => void;

export { ContextService, type IAgentSchema, type IAgentTool, type ICompletionSchema, type ISwarmSchema, type ReceiveMessageFn, type SendMessageFn, addAgent, addCompletion, addSwarm, addTool, changeAgent, commitSystemMessage, commitToolOutput, complete, disposeConnection, execute, getAgentHistory, getRawHistory, makeConnection, session, setConfig, swarm };
