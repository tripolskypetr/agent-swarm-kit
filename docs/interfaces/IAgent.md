# IAgent

Interface representing an agent.

## Properties

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

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Clears the history for the agent.

### commitAgentChange

```ts
commitAgentChange: () => Promise<void>
```

Unlock the queue on agent change. Stop the next tool execution
