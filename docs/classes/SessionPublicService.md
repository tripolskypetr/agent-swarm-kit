# SessionPublicService

Implements `TSessionConnectionService`

Service for managing public session interactions.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### sessionConnectionService

```ts
sessionConnectionService: any
```

### emit

```ts
emit: (content: string, requestId: string, clientId: string, swarmName: string) => Promise<void>
```

Emits a message to the session.

### execute

```ts
execute: (content: string, mode: ExecutionMode, requestId: string, clientId: string, swarmName: string) => Promise<string>
```

Executes a command in the session.

### connect

```ts
connect: (connector: SendMessageFn$1, requestId: string, clientId: string, swarmName: string) => ReceiveMessageFn
```

Connects to the session.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string, requestId: string, clientId: string, swarmName: string) => Promise<void>
```

Commits tool output to the session.

### commitSystemMessage

```ts
commitSystemMessage: (message: string, requestId: string, clientId: string, swarmName: string) => Promise<void>
```

Commits a system message to the session.

### commitUserMessage

```ts
commitUserMessage: (message: string, requestId: string, clientId: string, swarmName: string) => Promise<void>
```

Commits user message to the agent without answer.

### commitFlush

```ts
commitFlush: (requestId: string, clientId: string, swarmName: string) => Promise<void>
```

Commits flush of agent history

### dispose

```ts
dispose: (requestId: string, clientId: string, swarmName: string) => Promise<void>
```

Disposes of the session.
