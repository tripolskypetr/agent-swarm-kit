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
createAgentRef: (methodName: string, clientId: string, agentName: string) => Promise<ClientAgent>
```

Creates a reference to an agent.

### execute

```ts
execute: (input: string, mode: ExecutionMode, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Executes a command on the agent.

### run

```ts
run: (input: string, methodName: string, clientId: string, agentName: string) => Promise<string>
```

Run the completion stateless

### waitForOutput

```ts
waitForOutput: (methodName: string, clientId: string, agentName: string) => Promise<string>
```

Waits for the agent's output.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits tool output to the agent.

### commitSystemMessage

```ts
commitSystemMessage: (message: string, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits a system message to the agent.

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits an assistant message to the agent history.

### commitUserMessage

```ts
commitUserMessage: (message: string, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits user message to the agent without answer.

### commitFlush

```ts
commitFlush: (methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits flush of agent history

### commitAgentChange

```ts
commitAgentChange: (methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits change of agent to prevent the next tool execution from being called.

### commitStopTools

```ts
commitStopTools: (methodName: string, clientId: string, agentName: string) => Promise<void>
```

Prevent the next tool from being executed

### dispose

```ts
dispose: (methodName: string, clientId: string, agentName: string) => Promise<void>
```

Disposes of the agent.
