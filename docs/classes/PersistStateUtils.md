# PersistStateUtils

Implements `IPersistStateControl`

Utility class for managing state persistence

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

Memoized function to get storage for a specific state

### setState

```ts
setState: <T = unknown>(state: T, clientId: string, stateName: string) => Promise<void>
```

Sets the state for a client

### getState

```ts
getState: <T = unknown>(clientId: string, stateName: string, defaultState: T) => Promise<T>
```

Gets the state for a client

## Methods

### usePersistStateAdapter

```ts
usePersistStateAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStateData>): void;
```

Sets the factory for state persistence
