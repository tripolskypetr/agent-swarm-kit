---
title: docs/api-reference/interface/IHistory
group: docs
---

# IHistory

Interface representing the history of model messages within the swarm.
Provides methods to manage and retrieve a sequence of messages for an agent or raw usage.

## Methods

### push

```ts
push: (message: ISwarmMessage<object>) => Promise<void>
```

Adds a message to the end of the history.
Updates the history store asynchronously.

### pop

```ts
pop: () => Promise<ISwarmMessage<object>>
```

Removes and returns the last message from the history.

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string, system?: string[]) => Promise<ISwarmMessage<object>[]>
```

Converts the history into an array of messages tailored for a specific agent.
Filters or formats messages based on the provided prompt and optional system prompts.

### toArrayForRaw

```ts
toArrayForRaw: () => Promise<ISwarmMessage<object>[]>
```

Converts the entire history into an array of raw model messages.
Retrieves all messages without agent-specific filtering or formatting.
