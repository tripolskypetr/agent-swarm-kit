# SharedStateUtils

Implements `TSharedState`

Utility class for managing state in the agent swarm.

## Constructor

```ts
constructor();
```

## Properties

### getState

```ts
getState: <T extends unknown = any>(stateName: string) => Promise<T>
```

Retrieves the state for a given client and state name.

### setState

```ts
setState: <T extends unknown = any>(dispatchFn: T | ((prevSharedState: T) => Promise<T>), stateName: string) => Promise<void>
```

Sets the state for a given client and state name.

### clearState

```ts
clearState: <T extends unknown = any>(stateName: string) => Promise<T>
```

Set the state to initial value
