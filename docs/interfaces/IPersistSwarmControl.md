---
title: docs/api-reference/interface/IPersistSwarmControl
group: docs
---

# IPersistSwarmControl

Defines control methods for customizing swarm persistence operations.
Allows injection of custom persistence adapters for active agents and navigation stacks tied to `SwarmName`.

## Methods

### usePersistActiveAgentAdapter

```ts
usePersistActiveAgentAdapter: (Ctor: TPersistBaseCtor<string, IPersistActiveAgentData>) => void
```

Sets a custom persistence adapter for active agent storage.
Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory storage for `SwarmName`).

### usePersistNavigationStackAdapter

```ts
usePersistNavigationStackAdapter: (Ctor: TPersistBaseCtor<string, IPersistNavigationStackData>) => void
```

Sets a custom persistence adapter for navigation stack storage.
Overrides the default `PersistBase` implementation for specialized behavior (e.g., database storage for `SwarmName`).
