# IAgentSchema

Interface representing the schema for an agent.

## Properties

### agentName

```ts
agentName: string
```

The name of the agent.

### completion

```ts
completion: string
```

The name of the completion.

### prompt

```ts
prompt: string
```

The prompt for the agent.

### system

```ts
system: string[]
```

The system prompt. Usually used for tool calling protocol.

### tools

```ts
tools: string[]
```

The names of the tools used by the agent.

### validate

```ts
validate: (output: string) => Promise<string>
```

Validates the output.

### onExecute

```ts
onExecute: (clientId: string, agentName: string, input: string, mode: ExecutionMode) => void
```

Callback triggered when the agent executes.

### onToolOutput

```ts
onToolOutput: (clientId: string, agentName: string, content: string) => void
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
