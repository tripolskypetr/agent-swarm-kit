# AgentConnectionService

Implements `IAgent`

Service for managing agent connections.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### contextService

```ts
contextService: any
```

### sessionValidationService

```ts
sessionValidationService: any
```

### historyConnectionService

```ts
historyConnectionService: any
```

### agentSchemaService

```ts
agentSchemaService: any
```

### toolSchemaService

```ts
toolSchemaService: any
```

### completionSchemaService

```ts
completionSchemaService: any
```

### getAgent

```ts
getAgent: ((clientId: string, agentName: string) => ClientAgent) & IClearableMemoize<string> & IControlMemoize<string, ClientAgent>
```

Retrieves an agent instance.

### execute

```ts
execute: (input: string, mode: ExecutionMode) => Promise<void>
```

Executes an input command.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for the output from the agent.

### commitToolOutput

```ts
commitToolOutput: (content: string) => Promise<void>
```

Commits tool output.

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commits a system message.

### commitUserMessage

```ts
commitUserMessage: (message: string) => Promise<void>
```

Commits a user message without answer.

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Commits flush of agent history

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the agent connection.
