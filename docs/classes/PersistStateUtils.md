# PersistStateUtils

Implements `IPersistStateControl`

Utility class for managing state persistence per client and state name.
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
Ensures a single instance per state name.

### setState

```ts
setState: <T = unknown>(state: T, clientId: string, stateName: string) => Promise<void>
```

Sets the state for a client under a specific state name.
Persists the state data wrapped in an IPersistStateData structure.

### getState

```ts
getState: <T = unknown>(clientId: string, stateName: string, defaultState: T) => Promise<T>
```

Retrieves the state for a client under a specific state name, falling back to a default if not set.

## Methods

### usePersistStateAdapter

```ts
usePersistStateAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStateData>): void;
```

Sets a custom constructor for state persistence, overriding the default PersistBase.
