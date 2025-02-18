# IAgentSchemaCallbacks

Interface representing the lifecycle callbacks of an agent

## Properties

### onExecute

```ts
onExecute: (clientId: string, agentName: string, input: string, mode: ExecutionMode) => void
```

Callback triggered when the agent executes.

### onToolOutput

```ts
onToolOutput: (toolId: string, clientId: string, agentName: string, content: string) => void
```

Callback triggered when there is tool output.

### onSystemMessage

```ts
onSystemMessage: (clientId: string, agentName: string, message: string) => void
```

Callback triggered when there is a system message.

### onUserMessage

```ts
onUserMessage: (clientId: string, agentName: string, message: string) => void
```

Callback triggered when there is a user message.

### onFlush

```ts
onFlush: (clientId: string, agentName: string) => void
```

Callback triggered when the agent history is flushed.

### onOutput

```ts
onOutput: (clientId: string, agentName: string, output: string) => void
```

Callback triggered when there is output.

### onResurrect

```ts
onResurrect: (clientId: string, agentName: string, mode: ExecutionMode, reason?: string) => void
```

Callback triggered when the agent is resurrected.

### onInit

```ts
onInit: (clientId: string, agentName: string) => void
```

Callback triggered when agent is initialized

### onDispose

```ts
onDispose: (clientId: string, agentName: string) => void
```

Callback triggered when agent is disposed

### onAfterToolCalls

```ts
onAfterToolCalls: (clientId: string, agentName: string, toolCalls: IToolCall[]) => void
```

Callback triggered after all tools are called
