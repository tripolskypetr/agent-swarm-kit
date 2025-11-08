---
title: docs/api-reference/interface/IHistoryAdapter
group: docs
---

# IHistoryAdapter

Interface defining methods for interacting with a history adapter.

## Properties

### push

```ts
push: (value: ISwarmMessage<object>, clientId: string, agentName: string) => Promise<void>
```

Adds a new message to the history.

### pop

```ts
pop: (clientId: string, agentName: string) => Promise<ISwarmMessage<object>>
```

Removes and returns the last message from the history.

### dispose

```ts
dispose: (clientId: string, agentName: string) => Promise<void>
```

Disposes of the history for a client and agent, optionally clearing all data.

## Methods

### iterate

```ts
iterate: (clientId: string, agentName: string) => AsyncIterableIterator<ISwarmMessage<object>>
```

Iterates over history messages for a client and agent.
