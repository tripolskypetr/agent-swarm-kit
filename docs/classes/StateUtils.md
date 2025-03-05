# StateUtils

Implements `TState`

Utility class for managing state in the agent swarm.

## Constructor

```ts
constructor();
```

## Properties

### getState

```ts
getState: <T extends unknown = any>(payload: { clientId: string; agentName: string; stateName: string; }) => Promise<T>
```

Retrieves the state for a given client and state name.

### setState

```ts
setState: <T extends unknown = any>(dispatchFn: T | ((prevState: T) => Promise<T>), payload: { clientId: string; agentName: string; stateName: string; }) => Promise<void>
```

Sets the state for a given client and state name.

### clearState

```ts
clearState: <T extends unknown = any>(payload: { clientId: string; agentName: string; stateName: string; }) => Promise<T>
```

Set the state to initial value
