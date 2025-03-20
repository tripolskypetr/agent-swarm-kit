# IPersistStorageControl

Defines control methods for customizing storage persistence operations.
Allows injection of a custom persistence adapter for storage tied to `StorageName`.

## Methods

### usePersistStorageAdapter

```ts
usePersistStorageAdapter: (Ctor: TPersistBaseCtor<string, IPersistStorageData<IStorageData>>) => void
```

Sets a custom persistence adapter for storage.
Overrides the default `PersistBase` implementation for specialized behavior (e.g., database storage for `StorageName`).
