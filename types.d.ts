import * as di_scoped from 'di-scoped';
import * as src_interfaces_Agent_interface from 'src/interfaces/Agent.interface';
import { AgentName as AgentName$1, IAgent, IAgentSchema as IAgentSchema$1, ToolName as ToolName$1, IAgentTool as IAgentTool$1 } from 'src/interfaces/Agent.interface';
import ISwarm, { SwarmName, ISwarmSchema as ISwarmSchema$1 } from 'src/interfaces/Swarm.interface';
import * as functools_kit from 'functools-kit';
import { IPubsubArray } from 'functools-kit';
import ClientAgent from 'src/client/ClientAgent';
import IHistory from 'src/interfaces/History.interface';
import { IModelMessage as IModelMessage$1 } from 'src/model/ModelMessage.model';
import ClientHistory from 'src/client/ClientHistory';
import ClientSwarm from 'src/client/ClientSwarm';
import { ICompletionSchema as ICompletionSchema$1, CompletionName as CompletionName$1 } from 'src/interfaces/Completion.interface';
import ClientSession from 'src/client/ClientSession';
import { ISession, SendMessageFn as SendMessageFn$1, ReceiveMessageFn as ReceiveMessageFn$1, SessionId } from 'src/interfaces/Session.interface';
import { ITool as ITool$1 } from 'src/model/Tool.model';
import { IOutgoingMessage, IIncomingMessage } from 'src/model/EmitMessage.model';

interface IContext {
    clientId: string;
    agentName: AgentName$1;
    swarmName: SwarmName;
}
declare const ContextService: (new () => {
    readonly context: IContext;
}) & Omit<{
    new (context: IContext): {
        readonly context: IContext;
    };
}, "prototype"> & di_scoped.IScopedClassRun<[context: IContext]>;

interface ILogger {
    log(...args: any[]): void;
    debug(...args: any[]): void;
}

declare class LoggerService implements ILogger {
    private _logger;
    log: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    setLogger: (logger: ILogger) => void;
}

declare class AgentConnectionService implements IAgent {
    private readonly loggerService;
    private readonly contextService;
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

declare class HistoryConnectionService implements IHistory {
    private readonly loggerService;
    private readonly contextService;
    getItems: ((clientId: string) => IPubsubArray<IModelMessage$1>) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, IPubsubArray<IModelMessage$1>>;
    getHistory: ((clientId: string, agentName: string) => ClientHistory) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientHistory>;
    push: (message: IModelMessage$1) => Promise<void>;
    toArrayForAgent: (prompt: string) => Promise<IModelMessage$1[]>;
    toArrayForRaw: () => Promise<IModelMessage$1[]>;
    dispose: () => Promise<void>;
}

declare class AgentSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: AgentName$1, value: IAgentSchema$1) => void;
    get: (key: AgentName$1) => IAgentSchema$1;
    dispose: () => void;
}

declare class ToolSchemaService {
    private readonly loggerService;
    private registry;
    register: (key: ToolName$1, value: IAgentTool$1) => void;
    get: (key: ToolName$1) => IAgentTool$1;
    dispose: () => void;
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
    setAgentName: (agentName: AgentName$1) => Promise<void>;
    dispose: () => Promise<void>;
}

declare class SwarmSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: SwarmName, value: ISwarmSchema$1) => void;
    get: (key: SwarmName) => ISwarmSchema$1;
    dispose: () => void;
}

declare class CompletionSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: string, value: ICompletionSchema$1) => void;
    get: (key: string) => ICompletionSchema$1;
    dispose: () => void;
}

declare class SessionConnectionService implements ISession {
    private readonly loggerService;
    private readonly contextService;
    private readonly swarmConnectionService;
    getSession: ((clientId: string, swarmName: string) => ClientSession) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientSession>;
    execute: (content: string) => Promise<string>;
    connect: (connector: SendMessageFn$1) => ReceiveMessageFn$1;
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
    execute: (input: string, clientId: string, agentName: AgentName$1) => Promise<void>;
    waitForOutput: (clientId: string, agentName: AgentName$1) => Promise<string>;
    commitToolOutput: (content: string, clientId: string, agentName: AgentName$1) => Promise<void>;
    commitSystemMessage: (message: string, clientId: string, agentName: AgentName$1) => Promise<void>;
    dispose: (clientId: string, agentName: AgentName$1) => Promise<void>;
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
    push: (message: IModelMessage$1, clientId: string, agentName: AgentName$1) => Promise<void>;
    toArrayForAgent: (prompt: string, clientId: string, agentName: AgentName$1) => Promise<IModelMessage$1[]>;
    toArrayForRaw: (clientId: string, agentName: AgentName$1) => Promise<IModelMessage$1[]>;
    dispose: (clientId: string, agentName: AgentName$1) => Promise<void>;
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
    connect: (connector: SendMessageFn$1, clientId: string, swarmName: SwarmName) => ReceiveMessageFn$1;
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
    getAgent: (clientId: string, swarmName: SwarmName) => Promise<src_interfaces_Agent_interface.IAgent>;
    setAgentName: (agentName: AgentName$1, clientId: string, swarmName: SwarmName) => Promise<void>;
    dispose: (clientId: string, swarmName: SwarmName) => Promise<void>;
}

declare class AgentValidationService {
    private readonly loggerService;
    private readonly toolValidationService;
    private readonly completionValidationService;
    private _agentMap;
    addAgent: (agentName: AgentName$1, agentSchema: IAgentSchema$1) => void;
    validate: (agentName: AgentName$1) => void;
}

declare class ToolValidationService {
    private readonly loggerService;
    private _toolSet;
    addTool: (toolName: ToolName$1) => void;
    validate: (toolName: ToolName$1) => void;
}

declare class SessionValidationService {
    private readonly loggerService;
    private _sessionMap;
    addSession: (clientId: SessionId, swarmName: SwarmName) => void;
    getSessionList: () => string[];
    getSwarm: (clientId: SessionId) => string;
    removeSession: (clientId: SessionId) => void;
}

declare class SwarmValidationService {
    private readonly loggerService;
    private readonly agentValidationService;
    private _swarmMap;
    addSwarm: (swarmName: SwarmName, swarmSchema: ISwarmSchema$1) => void;
    getAgentList: (swarmName: SwarmName) => string[];
    validate: (swarmName: SwarmName) => void;
}

declare class CompletionValidationService {
    private readonly loggerService;
    private _completionSet;
    addCompletion: (completionName: CompletionName$1) => void;
    validate: (completionName: CompletionName$1) => void;
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

declare const addAgent: (agentName: AgentName$1, agentSchema: IAgentSchema$1) => void;

declare const addCompletion: (completionName: CompletionName$1, completionSchema: ICompletionSchema$1) => void;

declare const addSwarm: (swarmName: SwarmName, swarmSchema: ISwarmSchema$1) => void;

declare const addTool: (toolSchema: IAgentTool$1) => void;

declare const makeConnection: (connector: SendMessageFn$1, clientId: string, swarmName: SwarmName) => ReceiveMessageFn$1;

declare const changeAgent: (agentName: AgentName$1, clientId: string, swarmName: SwarmName) => Promise<void>;

declare const complete: (content: string, clientId: string, swarmName: SwarmName) => Promise<string>;

declare const disposeConnection: (clientId: string, swarmName: SwarmName) => Promise<void>;

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

declare const getRawHistory: (clientId: string) => Promise<IModelMessage[]>;

declare const getAgentHistory: (clientId: string, agentName: AgentName$1) => Promise<IModelMessage[]>;

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

interface ICompletionSchema {
    getCompletion(messages: IModelMessage$1[], tools?: ITool$1[]): Promise<IModelMessage$1>;
}
type CompletionName = string;

interface IAgentTool<T = Record<string, unknown>> extends ITool {
    call(clientId: string, agentName: AgentName, params: T): Promise<void>;
    validate(clientId: string, agentName: AgentName, params: T): Promise<boolean> | boolean;
}
interface IAgentSchema {
    completion: CompletionName;
    prompt: string;
    tools?: ToolName[];
    validate?: (output: string) => Promise<string | null>;
}
type AgentName = string;
type ToolName = string;

interface ISwarmSchema {
    defaultAgent: AgentName;
    agentList: string[];
}

type SendMessageFn = (outgoing: IOutgoingMessage) => Promise<void> | void;
type ReceiveMessageFn = (incoming: IIncomingMessage) => Promise<void> | void;

declare const GLOBAL_CONFIG: {
    CC_TOOL_CALL_EXCEPTION_PROMPT: string;
    CC_EMPTY_OUTPUT_PLACEHOLDERS: string[];
    CC_KEEP_MESSAGES: number;
};
declare const setConfig: (config: typeof GLOBAL_CONFIG) => void;

export { ContextService, type IAgentSchema, type IAgentTool, type ICompletionSchema, type ISwarmSchema, type ReceiveMessageFn, type SendMessageFn, addAgent, addCompletion, addSwarm, addTool, changeAgent, complete, disposeConnection, getAgentHistory, getRawHistory, makeConnection, setConfig, swarm };
