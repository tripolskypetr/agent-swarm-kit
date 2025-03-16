# SharedStateUtils

Implements `TSharedState`

Utility class for managing shared state within an agent swarm.
Provides methods to get, set, and clear state data for specific state names, interfacing with the swarm's shared state service.

## Constructor

```ts
constructor();
```

## Properties

### getState

```ts
getState: <T extends unknown = any>(stateName: string) => Promise<T>
```

Retrieves the shared state data for a given state name.
Executes within a context for logging and delegates to the shared state service.

### setState

```ts
setState: <T extends unknown = any>(dispatchFn: T | ((prevSharedState: T) => Promise<T>), stateName: string) => Promise<void>
```

Sets the shared state data for a given state name.
Accepts either a direct value or a function that computes the new state based on the previous state.
Executes within a context for logging and delegates to the shared state service.

### clearState

```ts
clearState: <T extends unknown = any>(stateName: string) => Promise<T>
```

Clears the shared state for a given state name, resetting it to its initial value.
Executes within a context for logging and delegates to the shared state service.
