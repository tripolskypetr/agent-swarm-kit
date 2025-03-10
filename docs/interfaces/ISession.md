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

### commitStopTools

```ts
commitStopTools: () => Promise<void>
```

Prevent the next tool from being executed

## Methods

### emit

```ts
emit: (message: string) => Promise<void>
```

Emit a message.

### run

```ts
run: (content: string) => Promise<string>
```

Run the complete stateless without modifying chat history

### execute

```ts
execute: (content: string, mode: ExecutionMode) => Promise<string>
```

Execute a command.

### connect

```ts
connect: (connector: SendMessageFn$1<void>, ...args: unknown[]) => ReceiveMessageFn<string>
```

Connect to a message sender.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string) => Promise<void>
```

Commit tool output.

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string) => Promise<void>
```

Commit assistant message without answer

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commit a system message.
