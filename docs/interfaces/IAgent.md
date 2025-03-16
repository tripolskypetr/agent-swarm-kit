# IAgent

Interface representing an agent's runtime behavior and interaction methods.
Defines how the agent processes inputs, commits messages, and manages its lifecycle.

## Properties

### run

```ts
run: (input: string) => Promise<string>
```

Runs the agent statelessly without modifying chat history.
Useful for one-off computations or previews.

### execute

```ts
execute: (input: string, mode: ExecutionMode) => Promise<void>
```

Executes the agent with the given input, potentially updating history based on mode.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for and retrieves the agent's output after execution.

## Methods

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string) => Promise<void>
```

Commits tool output to the agent's history or state.

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commits a system message to the agent's history or state.

### commitUserMessage

```ts
commitUserMessage: (message: string) => Promise<void>
```

Commits a user message to the agent's history without triggering a response.

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string) => Promise<void>
```

Commits an assistant message to the agent's history without triggering a response.

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Clears the agent's history, resetting it to an initial state.

### commitStopTools

```ts
commitStopTools: () => Promise<void>
```

Prevents the next tool in the execution sequence from running and stops further tool calls.

### commitAgentChange

```ts
commitAgentChange: () => Promise<void>
```

Unlocks the execution queue and signals an agent change, stopping subsequent tool executions.
