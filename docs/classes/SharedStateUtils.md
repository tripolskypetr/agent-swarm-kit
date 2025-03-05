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
getState: <T extends unknown = any>(payload: { agentName: string; stateName: string; }) => Promise<T>
```

Retrieves the state for a given client and state name.

### setState

```ts
setState: <T extends unknown = any>(dispatchFn: T | ((prevSharedState: T) => Promise<T>), payload: { agentName: string; stateName: string; }) => Promise<void>
```

Sets the state for a given client and state name.
