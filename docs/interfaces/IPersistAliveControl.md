# IPersistAliveControl

Defines control methods for customizing alive status persistence operations.
Allows injection of a custom persistence adapter for alive status tied to `SwarmName`.

## Methods

### usePersistAliveAdapter

```ts
usePersistAliveAdapter: (Ctor: TPersistBaseCtor<string, IPersistAliveData>) => void
```

Sets a custom persistence adapter for alive status storage.
Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory tracking for `SwarmName`).
