---
title: docs/api-reference/interface/IPersistMemoryData
group: docs
---

# IPersistMemoryData

Defines the structure for memory data persistence in the swarm system.
Wraps arbitrary memory data for storage, used by `PersistMemoryUtils`.

## Properties

### data

```ts
data: T
```

The memory data to persist (e.g., session context or temporary state)
