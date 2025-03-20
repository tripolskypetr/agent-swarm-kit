# IPersistStateControl

Interface defining control methods for state persistence operations.
Allows customization of the persistence adapter for states.

## Methods

### usePersistStateAdapter

```ts
usePersistStateAdapter: (Ctor: TPersistBaseCtor<string, IPersistStateData<unknown>>) => void
```

Sets a custom persistence adapter for state storage.
