# IPersistMemoryControl

Defines control methods for customizing memory persistence operations.
Allows injection of a custom persistence adapter for memory tied to `SessionId`.

## Methods

### usePersistMemoryAdapter

```ts
usePersistMemoryAdapter: (Ctor: TPersistBaseCtor<string, IPersistMemoryData<unknown>>) => void
```

Sets a custom persistence adapter for memory storage.
Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory storage for `SessionId`).
