# IPersistPolicyControl

Defines control methods for customizing policy persistence operations.
Allows injection of a custom persistence adapter for policy data tied to `SwarmName`.

## Methods

### usePersistPolicyAdapter

```ts
usePersistPolicyAdapter: (Ctor: TPersistBaseCtor<string, IPersistPolicyData>) => void
```

Sets a custom persistence adapter for policy data storage.
Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory tracking for `SwarmName`).
