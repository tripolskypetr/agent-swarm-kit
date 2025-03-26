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

## Methods

### call

```ts
call: (dto: { toolId: string; clientId: string; agentName: string; params: T; toolCalls: IToolCall[]; isLast: boolean; }) => Promise<void>
```

Executes the tool with the specified parameters and context.
