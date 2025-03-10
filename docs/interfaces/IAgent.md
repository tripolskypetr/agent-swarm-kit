# IAgent

Interface representing an agent.

## Properties

### run

```ts
run: (input: string) => Promise<string>
```

Run the complete stateless without write to the chat history

### execute

```ts
execute: (input: string, mode: ExecutionMode) => Promise<void>
```

Executes the agent with the given input.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for the output from the agent.

## Methods

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string) => Promise<void>
```

Commits the tool output.

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

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string) => Promise<void>
```

Commits an assistant message without answer.

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Clears the history for the agent.

### commitStopTools

```ts
commitStopTools: { (): Promise<void>; (): Promise<void>; }
```

Prevent the next tool from being executed
Prevent the next tool from execution

### commitAgentChange

```ts
commitAgentChange: () => Promise<void>
```

Unlock the queue on agent change. Stop the next tool execution

### commitStopTools

```ts
commitStopTools: { (): Promise<void>; (): Promise<void>; }
```

Prevent the next tool from being executed
Prevent the next tool from execution
