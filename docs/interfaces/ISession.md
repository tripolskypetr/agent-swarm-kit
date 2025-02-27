# ISession

Interface for a session.

## Properties

### commitUserMessage

```ts
commitUserMessage: (message: string) => Promise<void>
```

Commit user message without answer

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Commit flush of agent history

## Methods

### emit

```ts
emit: (message: string) => Promise<void>
```

Emit a message.

### execute

```ts
execute: (content: string, mode: ExecutionMode) => Promise<string>
```

Execute a command.

### connect

```ts
connect: (connector: SendMessageFn$1, ...args: unknown[]) => ReceiveMessageFn
```

Connect to a message sender.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string) => Promise<void>
```

Commit tool output.

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commit a system message.
