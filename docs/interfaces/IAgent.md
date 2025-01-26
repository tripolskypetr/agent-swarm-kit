# IAgent

Interface representing an agent.

## Properties

### execute

```ts
execute: (input: string) => Promise<void>
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
commitToolOutput: (content: string) => Promise<void>
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
