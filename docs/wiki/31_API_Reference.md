---
title: design/31_api_reference
group: design
---

# API Reference

This document provides complete API documentation for all public functions, interfaces, and configuration options in the agent-swarm-kit library. It covers the primary APIs developers use to build multi-agent AI systems, including agent creation, session management, tool integration, and system configuration.

For implementation details and usage patterns, see [Building Multi-Agent Systems](#5.1). For configuration best practices, see [Configuration and Global Settings](#7.2).

## Agent and Tool APIs

### Agent Definition

Agents are defined using `addAgent()` with an `IAgentSchemaInternal` configuration. Each agent has a prompt, optional tools, completion model, and lifecycle callbacks.

```typescript
interface IAgentSchemaInternal {
  agentName: AgentName;
  prompt?: string | ((clientId: string, agentName: AgentName) => Promise<string> | string);
  completion?: CompletionName;
  tools?: ToolName[];
  system?: string[];
  systemStatic?: string[];
  systemDynamic?: (clientId: string, agentName: AgentName) => Promise<string[]> | string[];
  operator?: boolean;
  connectOperator?: (clientId: string, agentName: AgentName) => (message: string, next: (answer: string) => void) => DisposeFn;
  maxToolCalls?: number;
  keepMessages?: number;
  validate?: (output: string) => Promise<string | null>;
  transform?: (input: string, clientId: string, agentName: AgentName) => Promise<string> | string;
  map?: (message: IModelMessage, clientId: string, agentName: AgentName) => IModelMessage | Promise<IModelMessage>;
  mapToolCalls?: (tool: IToolCall[], clientId: string, agentName: AgentName) => IToolCall[] | Promise<IToolCall[]>;
  storages?: StorageName[];
  states?: StateName[];
  mcp?: MCPName[];
  dependsOn?: AgentName[];
  // Lifecycle callbacks
  callbacks?: Partial<IAgentSchemaInternalCallbacks>;
}
```

Sources: [src/interfaces/Agent.interface.ts:386-491](), [types.d.ts:386-491]()

### Tool Definition

Tools are defined using `addTool()` with an `IAgentTool` interface that specifies execution logic, validation, and OpenAI-compatible function metadata.

```typescript
interface IAgentTool<T = Record<string, ToolValue>> {
  toolName: ToolName;
  type: ITool['type'];
  function: ITool['function'] | ((clientId: string, agentName: AgentName) => ITool['function'] | Promise<ITool['function']>);
  call(dto: {
    toolId: string;
    clientId: string;
    agentName: AgentName;
    params: T;
    toolCalls: IToolCall[];
    abortSignal: TAbortSignal;
    callReason: string;
    isLast: boolean;
  }): Promise<void>;
  validate?: (dto: {
    clientId: string;
    agentName: AgentName;
    toolCalls: IToolCall[];
    params: T;
  }) => Promise<boolean> | boolean;
  callbacks?: Partial<IAgentToolCallbacks>;
}
```

Sources: [src/interfaces/Agent.interface.ts:115-170](), [docs/interfaces/IAgentTool.md:1-71]()

### Agent Execution Flow

![Mermaid Diagram](./diagrams\31_API_Reference_2.svg)

Sources: [src/client/ClientAgent.ts:319-606](), [src/client/ClientSession.ts:149-253](), [src/lib/services/public/SessionPublicService.ts:188-350]()

## Session and Swarm APIs

### Session Management

Sessions are created using `session()` and provide the primary interface for client interactions with the swarm system.

```typescript
interface ISession {
  notify(message: string): Promise<void>;
  emit(message: string): Promise<void>;
  run(content: string): Promise<string>;
  execute(content: string, mode: ExecutionMode): Promise<string>;
  connect(connector: SendMessageFn, ...args: unknown[]): ReceiveMessageFn<string>;
  commitUserMessage(content: string): Promise<void>;
  commitAssistantMessage(content: string): Promise<void>;
  commitSystemMessage(content: string): Promise<void>;
  commitToolOutput(toolId: string, content: string): Promise<void>;
  commitFlush(): Promise<void>;
  commitStopTools(): Promise<void>;
  commitToolRequest(request: IToolRequest[]): Promise<void>;
  cancelOutput(): Promise<void>;
  dispose(): Promise<void>;
}
```

Sources: [src/interfaces/Session.interface.ts:67-142](), [src/client/ClientSession.ts:24-270]()

### Swarm Configuration

Swarms are configured using `addSwarm()` with an `ISwarmSchema` that defines agents, default agent, policies, and navigation behavior.

```typescript
interface ISwarmSchema {
  swarmName: SwarmName;
  agents: AgentName[];
  defaultAgent: AgentName;
  policies?: PolicyName[];
  callbacks?: Partial<ISwarmCallbacks>;
}
```

Sources: [types.d.ts:1264-1291]()

## Storage and State APIs

### Storage Interface

The `IStorage` interface provides embedding-based storage with similarity search capabilities.

```typescript
interface IStorage<T extends IStorageData = IStorageData> {
  take(search: string, total: number, score?: number): Promise<T[]>;
  upsert(item: T): Promise<void>;
  remove(itemId: IStorageData["id"]): Promise<void>;
  get(itemId: IStorageData["id"]): Promise<T | null>;
  list(filter?: (item: T) => boolean): Promise<T[]>;
  clear(): Promise<void>;
}
```

### State Interface

The `IState` interface provides key-value state management with middleware support.

```typescript
interface IState<T extends IStateData = IStateData> {
  read(): Promise<T>;
  write(state: T): Promise<void>;
  clear(): Promise<void>;
}
```

Sources: [types.d.ts:326-374](), [types.d.ts:511-525]()

## Configuration APIs

### Global Configuration

The system behavior is controlled through `GLOBAL_CONFIG` which can be modified using `setConfig()`.

```typescript
interface IGlobalConfig {
  CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT: string;
  CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT: string;
  CC_EMPTY_OUTPUT_PLACEHOLDERS: string[];
  CC_KEEP_MESSAGES: number;
  CC_MAX_TOOL_CALLS: number;
  CC_LOGGER_ENABLE_INFO: boolean;
  CC_LOGGER_ENABLE_DEBUG: boolean;
  CC_LOGGER_ENABLE_LOG: boolean;
  CC_RESQUE_STRATEGY: "flush" | "recomplete" | "custom";
  CC_STORAGE_SEARCH_SIMILARITY: number;
  CC_STORAGE_SEARCH_POOL: number;
  // ... additional configuration options
}

// Usage
import { setConfig } from 'agent-swarm-kit';

setConfig({
  CC_LOGGER_ENABLE_DEBUG: true,
  CC_MAX_TOOL_CALLS: 3,
  CC_RESQUE_STRATEGY: "recomplete"
});
```

Sources: [src/config/params.ts:235-302](), [src/model/GlobalConfig.model.ts:21-287]()

## Event System APIs

### Event Bus

The `IBus` interface provides event-driven communication across the system.

```typescript
interface IBus {
  emit<T extends IBaseEvent = IBusEvent>(clientId: string, event: T): Promise<void>;
  subscribe<T extends IBaseEvent = IBusEvent>(
    clientId: string,
    eventType: EventSource,
    listener: (event: T) => void
  ): Subject<void>;
}
```

### Event Types

```typescript
interface IBusEvent extends IBaseEvent {
  type: "run" | "emit" | "execute" | "push" | "pop" | "init" | "dispose" | "connect" | "disconnect";
  source: EventSource;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  context: IBusEventContext;
  clientId: string;
}
```

Sources: [types.d.ts:697-717](), [types.d.ts:778-798]()

## Function Reference

### Setup Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `addAgent(schema: IAgentSchemaInternal)` | Define an agent with prompt, tools, and completion model | `void` |
| `addSwarm(schema: ISwarmSchema)` | Define a swarm with agents and navigation rules | `void` |
| `addTool(tool: IAgentTool)` | Register a tool for agent use | `void` |
| `addCompletion(schema: ICompletionSchema)` | Register an AI completion provider | `void` |
| `addStorage(schema: IStorageSchema)` | Define embedding-based storage | `void` |
| `addState(schema: IStateSchema)` | Define stateful data management | `void` |
| `addPolicy(schema: IPolicySchema)` | Define access control policies | `void` |
| `addEmbedding(schema: IEmbeddingSchema)` | Register embedding provider | `void` |

### Target Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `session(clientId: string, swarmName: string)` | Create session connection | `ReceiveMessageFn<string>` |
| `complete(message: string)` | Execute message and return response | `Promise<string>` |
| `execute(message: string, mode?: ExecutionMode)` | Execute with specific mode | `Promise<string>` |
| `emit(message: string)` | Emit message to session listeners | `Promise<void>` |
| `runStateless(message: string)` | Run without updating history | `Promise<string>` |
| `fork(fn: () => Promise<T>)` | Execute in isolated context | `Promise<T>` |
| `scope(overrides: Partial<ISchemaContext>, fn: () => Promise<T>)` | Execute with schema overrides | `Promise<T>` |

### Commit Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `commitUserMessage(content: string)` | Add user message to history | `Promise<void>` |
| `commitAssistantMessage(content: string)` | Add assistant response to history | `Promise<void>` |
| `commitSystemMessage(content: string)` | Add system message to history | `Promise<void>` |
| `commitToolOutput(toolId: string, content: string)` | Add tool execution result | `Promise<void>` |
| `commitFlush()` | Clear conversation history | `Promise<void>` |
| `cancelOutput()` | Cancel current output emission | `Promise<void>` |

Sources: [src/index.ts:15-112](), [docs/index.md:105-196]()