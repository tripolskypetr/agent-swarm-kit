# IPersistMemoryControl

Interface defining control methods for memory persistence operations.
Allows customization of the persistence adapter for memory.

## Methods

### usePersistMemoryAdapter

```ts
usePersistMemoryAdapter: (Ctor: TPersistBaseCtor<string, IPersistMemoryData<unknown>>) => void
```

Sets a custom persistence adapter for memory storage.
