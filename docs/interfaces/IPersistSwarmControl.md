# IPersistSwarmControl

Interface defining control methods for swarm persistence operations.
Allows customization of persistence adapters for active agents and navigation stacks.

## Methods

### usePersistActiveAgentAdapter

```ts
usePersistActiveAgentAdapter: (Ctor: TPersistBaseCtor<string, IPersistActiveAgentData>) => void
```

Sets a custom persistence adapter for active agent storage.

### usePersistNavigationStackAdapter

```ts
usePersistNavigationStackAdapter: (Ctor: TPersistBaseCtor<string, IPersistNavigationStackData>) => void
```

Sets a custom persistence adapter for navigation stack storage.
