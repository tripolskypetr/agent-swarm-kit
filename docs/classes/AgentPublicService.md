# AgentPublicService

Implements `TAgentConnectionService`

Service for managing public agent operations.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### agentConnectionService

```ts
agentConnectionService: any
```

### createAgentRef

```ts
createAgentRef: (requestId: string, clientId: string, agentName: string) => Promise<ClientAgent>
```

Creates a reference to an agent.

### execute

```ts
execute: (input: string, mode: ExecutionMode, requestId: string, clientId: string, agentName: string) => Promise<void>
```

Executes a command on the agent.

### waitForOutput

```ts
waitForOutput: (requestId: string, clientId: string, agentName: string) => Promise<string>
```

Waits for the agent's output.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string, requestId: string, clientId: string, agentName: string) => Promise<void>
```

Commits tool output to the agent.

### commitSystemMessage

```ts
commitSystemMessage: (message: string, requestId: string, clientId: string, agentName: string) => Promise<void>
```

Commits a system message to the agent.

### commitUserMessage

```ts
commitUserMessage: (message: string, requestId: string, clientId: string, agentName: string) => Promise<void>
```

Commits user message to the agent without answer.

### commitFlush

```ts
commitFlush: (requestId: string, clientId: string, agentName: string) => Promise<void>
```

Commits flush of agent history

### commitAgentChange

```ts
commitAgentChange: (requestId: string, clientId: string, agentName: string) => Promise<void>
```

Commits change of agent to prevent the next tool execution from being called.

### dispose

```ts
dispose: (requestId: string, clientId: string, agentName: string) => Promise<void>
```

Disposes of the agent.
