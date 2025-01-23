# AgentPublicService

Implements `TAgentConnectionService`

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

### execute

```ts
execute: (input: string, clientId: string, agentName: string) => Promise<void>
```

### waitForOutput

```ts
waitForOutput: (clientId: string, agentName: string) => Promise<string>
```

### commitToolOutput

```ts
commitToolOutput: (content: string, clientId: string, agentName: string) => Promise<void>
```

### commitSystemMessage

```ts
commitSystemMessage: (message: string, clientId: string, agentName: string) => Promise<void>
```

### dispose

```ts
dispose: (clientId: string, agentName: string) => Promise<void>
```
