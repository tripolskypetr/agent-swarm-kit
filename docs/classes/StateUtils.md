# StateUtils

Implements `TState`

Utility class for managing client-specific state within an agent swarm.
Provides methods to get, set, and clear state data for specific clients, agents, and state names,
interfacing with the swarm's state service and enforcing agent-state registration.

## Constructor

```ts
constructor();
```

## Properties

### getState

```ts
getState: <T extends unknown = any>(payload: { clientId: string; agentName: string; stateName: string; }) => Promise<T>
```

Retrieves the state data for a given client, agent, and state name.
Validates the client session and agent-state registration before querying the state service.
Executes within a context for logging.

### setState

```ts
setState: <T extends unknown = any>(dispatchFn: T | ((prevState: T) => Promise<T>), payload: { clientId: string; agentName: string; stateName: string; }) => Promise<void>
```

Sets the state data for a given client, agent, and state name.
Accepts either a direct value or a function that computes the new state based on the previous state.
Validates the client session and agent-state registration before updating via the state service.
Executes within a context for logging.

### clearState

```ts
clearState: <T extends unknown = any>(payload: { clientId: string; agentName: string; stateName: string; }) => Promise<T>
```

Clears the state data for a given client, agent, and state name, resetting it to its initial value.
Validates the client session and agent-state registration before clearing via the state service.
Executes within a context for logging.
