---
title: docs/api-reference/interface/IAgentParams
group: docs
---

# IAgentParams

Interface representing the runtime parameters for an agent.
Combines schema properties (excluding certain fields) with callbacks and runtime dependencies.

## Properties

### clientId

```ts
clientId: string
```

The ID of the client interacting with the agent.

### logger

```ts
logger: ILogger
```

The logger instance for recording agent activity and errors.

### bus

```ts
bus: IBus
```

The bus instance for event communication within the swarm.

### mcp

```ts
mcp: IMCP
```

The mcp instance for external tool call

### history

```ts
history: IHistory
```

The history instance for tracking agent interactions.

### completion

```ts
completion: ICompletion
```

The completion instance for generating responses or outputs.

### tools

```ts
tools: IAgentTool<Record<string, ToolValue>>[]
```

Optional array of tools available to the agent for execution.

### validate

```ts
validate: (output: string) => Promise<string>
```

Validates the agent's output before finalization.
