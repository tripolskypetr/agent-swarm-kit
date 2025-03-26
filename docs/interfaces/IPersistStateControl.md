---
title: docs/api-reference/interface/IPersistStateControl
group: docs
---

# IPersistStateControl

Defines control methods for customizing state persistence operations.
Allows injection of a custom persistence adapter for states tied to `StateName`.

## Methods

### usePersistStateAdapter

```ts
usePersistStateAdapter: (Ctor: TPersistBaseCtor<string, IPersistStateData<unknown>>) => void
```

Sets a custom persistence adapter for state storage.
Overrides the default `PersistBase` implementation for specialized behavior (e.g., database storage for `StateName`).
