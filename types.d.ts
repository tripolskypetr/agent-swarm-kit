import * as di_scoped from 'di-scoped';
import * as src_interfaces_Agent_interface from 'src/interfaces/Agent.interface';
import { AgentName, IAgent, IAgentSpec, IAgentToolSignature } from 'src/interfaces/Agent.interface';
import ISwarm, { SwarmName, ISwarmSpec } from 'src/interfaces/Swarm.interface';
import * as functools_kit from 'functools-kit';
import { IPubsubArray } from 'functools-kit';
import ClientAgent from 'src/client/ClientAgent';
import IHistory from 'src/interfaces/History.interface';
import { IModelMessage } from 'src/model/ModelMessage.model';
import ClientHistory from 'src/client/ClientHistory';
import ClientSwarm from 'src/client/ClientSwarm';
import { ICompletion } from 'src/interfaces/Completion.interface';
import ClientSession from 'src/client/ClientSession';
import { ISession, SendMessageFn, ReceiveMessageFn } from 'src/interfaces/Session.interface';

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
    private readonly agentSpecService;
    private readonly toolSpecService;
    private readonly completionSpecService;
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

declare class AgentSpecService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: string, value: IAgentSpec) => void;
    get: (key: string) => IAgentSpec;
    dispose: () => void;
}

declare class ToolSpecService {
    private readonly loggerService;
    private registry;
    register: (key: string, value: IAgentToolSignature) => void;
    get: (key: string) => IAgentToolSignature;
    dispose: () => void;
}

declare class SwarmConnectionService implements ISwarm {
    private readonly loggerService;
    private readonly contextService;
    private readonly agentConnectionService;
    private readonly swarmSpecService;
    getSwarm: ((clientId: string, swarmName: string) => ClientSwarm) & functools_kit.IClearableMemoize<string> & functools_kit.IControlMemoize<string, ClientSwarm>;
    waitForOutput: () => Promise<string>;
    getAgentName: () => Promise<string>;
    getAgent: () => Promise<IAgent>;
    setAgentName: (agentName: AgentName) => Promise<void>;
    dispose: () => Promise<void>;
}

declare class SwarmSpecService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: string, value: IAgentSpec) => void;
    get: (key: string) => ISwarmSpec;
    dispose: () => void;
}

declare class CompletionSpecService {
    readonly loggerService: LoggerService;
    private registry;
    register: (key: string, value: ICompletion) => void;
    get: (key: string) => ICompletion;
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

declare const swarm: {
    agentPublicService: AgentPublicService;
    historyPublicService: HistoryPublicService;
    sessionPublicService: SessionPublicService;
    swarmPublicService: SwarmPublicService;
    agentSpecService: AgentSpecService;
    toolSpecService: ToolSpecService;
    swarmSpecService: SwarmSpecService;
    completionSpecService: CompletionSpecService;
    agentConnectionService: AgentConnectionService;
    historyConnectionService: HistoryConnectionService;
    swarmConnectionService: SwarmConnectionService;
    sessionConnectionService: SessionConnectionService;
    loggerService: LoggerService;
    contextService: {
        readonly context: IContext;
    };
};

export { ContextService, swarm };
