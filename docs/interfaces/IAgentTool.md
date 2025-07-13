---
title: docs/api-reference/interface/IAgentTool
group: docs
---

# IAgentTool

Interface representing a tool used by an agent, extending the base ITool interface.
Defines the tool's execution and validation logic, with optional lifecycle callbacks.

## Properties

### docNote

```ts
docNote: string
```

Optional description for documentation purposes, aiding in tool usage understanding.

### toolName

```ts
toolName: string
```

The unique name of the tool, used for identification within the agent swarm.

### isAvailable

```ts
isAvailable: (clientId: string, agentName: string, toolName: string) => boolean | Promise<boolean>
```

Checks if the tool is available for execution.
This method can be used to determine if the tool can be executed based on the current context.

### validate

```ts
validate: (dto: { clientId: string; agentName: string; toolCalls: IToolCall[]; params: T; }) => boolean | Promise<boolean>
```

Validates the tool parameters before execution.
Can return synchronously or asynchronously based on validation complexity.

### callbacks

```ts
callbacks: Partial<IAgentToolCallbacks<Record<string, ToolValue>>>
```

Optional lifecycle callbacks for the tool, allowing customization of execution flow.

### type

```ts
type: string
```

Tool type defenition. For now, should be `function`

### function

```ts
function: { name: string; description: string; parameters: { type: string; required: string[]; properties: { [key: string]: { type: string; description: string; enum?: string[]; }; }; }; } | ((clientId: string, agentName: string) => { ...; } | Promise<...>)
```

Optional dynamic factory to resolve tool metadata

## Methods

### call

```ts
call: (dto: { toolId: string; clientId: string; agentName: string; params: T; toolCalls: IToolCall[]; abortSignal: TAbortSignal; callReason: string; isLast: boolean; }) => Promise<...>
```

Executes the tool with the specified parameters and context.
