# SessionConnectionService

Implements `ISession`

Service for managing session connections.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### busService

```ts
busService: any
```

### methodContextService

```ts
methodContextService: any
```

### swarmConnectionService

```ts
swarmConnectionService: any
```

### policyConnectionService

```ts
policyConnectionService: any
```

### swarmSchemaService

```ts
swarmSchemaService: any
```

### getSession

```ts
getSession: ((clientId: string, swarmName: string) => ClientSession) & IClearableMemoize<string> & IControlMemoize<string, ClientSession>
```

Retrieves a memoized session based on clientId and swarmName.

### emit

```ts
emit: (content: string) => Promise<void>
```

Emits a message to the session.

### execute

```ts
execute: (content: string, mode: ExecutionMode) => Promise<string>
```

Executes a command in the session.

### run

```ts
run: (content: string) => Promise<string>
```

Run the completion stateless

### connect

```ts
connect: (connector: SendMessageFn$1<void>, clientId: string, swarmName: string) => ReceiveMessageFn<string>
```

Connects to the session using the provided connector.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string) => Promise<void>
```

Commits tool output to the session.

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commits a system message to the session.

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string) => Promise<void>
```

Commits an assistant message to the session.

### commitUserMessage

```ts
commitUserMessage: (message: string) => Promise<void>
```

Commits user message to the agent without answer.

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Commits user message to the agent without answer.

### commitStopTools

```ts
commitStopTools: () => Promise<void>
```

Commits user message to the agent without answer.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the session connection service.
