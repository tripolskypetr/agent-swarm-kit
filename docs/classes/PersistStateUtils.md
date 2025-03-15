# PersistStateUtils

Implements `IPersistStateControl`

Utility class for managing state persistence.

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

### setState

```ts
setState: <T = unknown>(state: T, clientId: string, stateName: string) => Promise<void>
```

Sets the state for a client under a specific state name.

### getState

```ts
getState: <T = unknown>(clientId: string, stateName: string, defaultState: T) => Promise<T>
```

Retrieves the state for a client under a specific state name.

## Methods

### usePersistStateAdapter

```ts
usePersistStateAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStateData>): void;
```

Sets a custom constructor for state persistence.
