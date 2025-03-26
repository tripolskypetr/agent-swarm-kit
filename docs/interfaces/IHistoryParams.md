---
title: docs/api-reference/interface/IHistoryParams
group: docs
---

# IHistoryParams

Interface representing the parameters required to create a history instance.
Extends the history schema with runtime dependencies for agent-specific history management.

## Properties

### agentName

```ts
agentName: string
```

The unique name of the agent associated with this history instance.

### clientId

```ts
clientId: string
```

The unique ID of the client associated with this history instance.

### logger

```ts
logger: ILogger
```

The logger instance for recording history-related activity and errors.

### bus

```ts
bus: IBus
```

The bus instance for event communication within the swarm.
