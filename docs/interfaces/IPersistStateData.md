---
title: docs/api-reference/interface/IPersistStateData
group: docs
---

# IPersistStateData

Defines the structure for state data persistence in the swarm system.
Wraps arbitrary state data for storage, used by `PersistStateUtils`.

## Properties

### state

```ts
state: T
```

The state data to persist (e.g., agent configuration or session state)
