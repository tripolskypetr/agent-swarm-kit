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
createAgentRef: (clientId: string, agentName: string) => Promise<ClientAgent>
```

Creates a reference to an agent.

### execute

```ts
execute: (input: string, clientId: string, agentName: string) => Promise<void>
```

Executes a command on the agent.

### waitForOutput

```ts
waitForOutput: (clientId: string, agentName: string) => Promise<string>
```

Waits for the agent's output.

### commitToolOutput

```ts
commitToolOutput: (content: string, clientId: string, agentName: string) => Promise<void>
```

Commits tool output to the agent.

### commitSystemMessage

```ts
commitSystemMessage: (message: string, clientId: string, agentName: string) => Promise<void>
```

Commits a system message to the agent.

### dispose

```ts
dispose: (clientId: string, agentName: string) => Promise<void>
```

Disposes of the agent.
