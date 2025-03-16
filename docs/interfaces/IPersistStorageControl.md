# IPersistStorageControl

Interface defining control methods for storage persistence operations.
Allows customization of the persistence adapter for storage.

## Methods

### usePersistStorageAdapter

```ts
usePersistStorageAdapter: (Ctor: TPersistBaseCtor<string, IPersistStorageData<IStorageData>>) => void
```

Sets a custom persistence adapter for storage.
