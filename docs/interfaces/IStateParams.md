---
title: docs/api-reference/interface/IStateParams
group: docs
---

# IStateParams

Interface representing the runtime parameters for state management.
Extends the state schema with client-specific runtime dependencies.

## Properties

### clientId

```ts
clientId: string
```

The unique ID of the client associated with the state instance.

### logger

```ts
logger: ILogger
```

The logger instance for recording state-related activity and errors.

### bus

```ts
bus: IBus
```

The bus instance for event communication within the swarm.
