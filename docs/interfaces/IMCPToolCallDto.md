---
title: docs/api-reference/interface/IMCPToolCallDto
group: docs
---

# IMCPToolCallDto

Interface for the data transfer object used in MCP tool calls.

## Properties

### toolId

```ts
toolId: string
```

Unique identifier for the tool.

### clientId

```ts
clientId: string
```

Identifier for the client making the tool call.

### agentName

```ts
agentName: string
```

Name of the agent associated with the tool call.

### params

```ts
params: T
```

Parameters for the tool call.

### toolCalls

```ts
toolCalls: IToolCall[]
```

Array of tool calls associated with this request.

### abortSignal

```ts
abortSignal: TAbortSignal
```

Signal to abort the tool call operation.

### isLast

```ts
isLast: boolean
```

Indicates if this is the last tool call in a sequence.
