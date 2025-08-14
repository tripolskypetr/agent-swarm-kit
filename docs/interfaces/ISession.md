---
title: docs/api-reference/interface/ISession
group: docs
---

# ISession

Interface representing a session within the swarm.
Defines methods for message emission, execution, and state management.

## Properties

### commitUserMessage

```ts
commitUserMessage: (message: string, mode: ExecutionMode) => Promise<void>
```

Commits a user message to the session's history without triggering a response.

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Commits a flush operation to clear the session's agent history.
Resets the history to an initial state.

### commitStopTools

```ts
commitStopTools: () => Promise<void>
```

Prevents the next tool in the execution sequence from running.
Stops further tool calls within the session.

## Methods

### notify

```ts
notify: (message: string) => Promise<void>
```

Sends a notification message to connect listeners via the internal `_notifySubject`.
Logs the notification if debugging is enabled.

### emit

```ts
emit: (message: string) => Promise<void>
```

Emits a message to the session's communication channel.

### run

```ts
run: (content: string) => Promise<string>
```

Runs a stateless completion without modifying the session's chat history.
Useful for one-off computations or previews.

### execute

```ts
execute: (content: string, mode: ExecutionMode) => Promise<string>
```

Executes a command within the session, potentially updating history based on mode.

### connect

```ts
connect: (connector: SendMessageFn<void>, ...args: unknown[]) => ReceiveMessageFn<string>
```

Connects the session to a message sender and returns a receiver function.
Establishes a bidirectional communication channel.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string) => Promise<void>
```

Commits tool output to the session's history or state.

### commitToolRequest

```ts
commitToolRequest: (request: IToolRequest[]) => Promise<string[]>
```

Commits a tool request to the session's history or state.

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string) => Promise<void>
```

Commits an assistant message to the session's history without triggering a response.

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commits a system message to the session's history or state.

### commitDeveloperMessage

```ts
commitDeveloperMessage: (message: string) => Promise<void>
```

Commits a developer message to the session's history or state.
