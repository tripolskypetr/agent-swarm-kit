import * as di_scoped from 'di-scoped';
import * as src_interfaces_Agent_interface from 'src/interfaces/Agent.interface';
import { AgentName, IAgent, IAgentSchema, ToolName, IAgentTool } from 'src/interfaces/Agent.interface';
import ISwarm, { SwarmName, ISwarmSchema } from 'src/interfaces/Swarm.interface';
import * as functools_kit from 'functools-kit';
import { IPubsubArray } from 'functools-kit';
import ClientAgent from 'src/client/ClientAgent';
import IHistory from 'src/interfaces/History.interface';
import { IModelMessage } from 'src/model/ModelMessage.model';
import ClientHistory from 'src/client/ClientHistory';
import ClientSwarm from 'src/client/ClientSwarm';
import { ICompletionSchema, CompletionName } from 'src/interfaces/Completion.interface';
import ClientSession from 'src/client/ClientSession';
import { ISession, SendMessageFn, ReceiveMessageFn, SessionId } from 'src/interfaces/Session.interface';

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
    dispose: () => void;
}

declare class ToolSchemaService {
    private readonly loggerService;
    private registry;
    register: (key: ToolName, value: IAgentTool) => void;
    get: (key: ToolName) => IAgentTool;
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
    setAgentName: (agentName: AgentName) => Promise<void>;
    dispose: () => Promise<void>;
}

declare class SwarmSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: SwarmName, value: ISwarmSchema) => void;
    get: (key: SwarmName) => ISwarmSchema;
    dispose: () => void;
}

declare class CompletionSchemaService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: string, value: ICompletionSchema) => void;
    get: (key: string) => ICompletionSchema;
    dispose: () => void;
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
    getAgent: (clientId: string, swarmName: SwarmName) => Promise<src_interfaces_Agent_interface.IAgent>;
    setAgentName: (agentName: AgentName, clientId: string, swarmName: SwarmName) => Promise<void>;
    dispose: (clientId: string, swarmName: SwarmName) => Promise<void>;
}

declare class AgentValidationService {
    private readonly loggerService;
    private readonly toolValidationService;
    private readonly completionValidationService;
    private _agentMap;
    addAgent: (agentName: AgentName, agentSchema: IAgentSchema) => void;
    validate: (agentName: AgentName) => void;
}

declare class ToolValidationService {
    private readonly loggerService;
    private _toolSet;
    addTool: (toolName: ToolName) => void;
    validate: (toolName: ToolName) => void;
}

declare class SessionValidationService {
    private readonly loggerService;
    private _sessionMap;
    addSession: (clientId: SessionId, swarmName: SwarmName) => void;
    removeSession: (clientId: SessionId) => void;
}

declare class SwarmValidationService {
    private readonly loggerService;
    private readonly agentValidationService;
    private _swarmMap;
    addSwarm: (swarmName: SwarmName, swarmSchema: ISwarmSchema) => void;
    getAgentList: (swarmName: SwarmName) => string[];
    validate: (swarmName: SwarmName) => void;
}

declare class CompletionValidationService {
    private readonly loggerService;
    private _completionSet;
    addCompletion: (completionName: CompletionName) => void;
    validate: (completionName: CompletionName) => void;
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

declare const addAgent: (agentName: AgentName, agentSchema: IAgentSchema) => void;

declare const addCompletion: (completionName: CompletionName, completionSchema: ICompletionSchema) => void;

declare const addSwarm: (swarmName: SwarmName, swarmSchema: ISwarmSchema) => void;

declare const addTool: (toolSchema: IAgentTool) => void;

declare const makeConnection: (connector: SendMessageFn, clientId: string, swarmName: SwarmName) => ReceiveMessageFn;

declare const changeAgent: (agentName: AgentName, clientId: string, swarmName: SwarmName) => Promise<void>;

declare const complete: (content: string, clientId: string, swarmName: SwarmName) => Promise<string>;

declare const disposeConnection: (clientId: string, swarmName: SwarmName) => Promise<void>;

declare const GLOBAL_CONFIG: {
    CC_TOOL_CALL_EXCEPTION_PROMPT: string;
    CC_EMPTY_OUTPUT_PLACEHOLDERS: string[];
    CC_KEEP_MESSAGES: number;
};
declare const setConfig: (config: typeof GLOBAL_CONFIG) => void;

export { ContextService, addAgent, addCompletion, addSwarm, addTool, changeAgent, complete, disposeConnection, makeConnection, setConfig, swarm };
