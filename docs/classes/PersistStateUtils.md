# PersistStateUtils

Implements `IPersistStateControl`

Utility class for managing state persistence per client (`SessionId`) and state name (`StateName`) in the swarm system.
Provides methods to get/set state data with a customizable persistence adapter.

## Constructor

```ts
constructor();
```

## Properties

### PersistStateFactory

```ts
PersistStateFactory: any
```

### getStateStorage

```ts
getStateStorage: any
```

Memoized function to create or retrieve storage for a specific state.
Ensures a single persistence instance per `StateName`, optimizing resource use.

### setState

```ts
setState: <T = unknown>(state: T, clientId: string, stateName: string) => Promise<void>
```

Sets the state for a client under a specific state name, persisting it for future retrieval.
Stores state data for a `SessionId` under a `StateName` (e.g., agent variables).

### getState

```ts
getState: <T = unknown>(clientId: string, stateName: string, defaultState: T) => Promise<T>
```

Retrieves the state for a client under a specific state name, falling back to a default if unset.
Restores state for a `SessionId` under a `StateName` (e.g., resuming agent context).

## Methods

### usePersistStateAdapter

```ts
usePersistStateAdapter(Ctor: TPersistBaseCtor<StateName, IPersistStateData>): void;
```

Configures a custom constructor for state persistence, overriding the default `PersistBase`.
Enables advanced state storage for `StateName` (e.g., in-memory or database-backed persistence).
