---
title: docs/api-reference/interface/IStateSchema
group: docs
---

# IStateSchema

Interface representing the schema for state management.
Defines the configuration and behavior of a state within the swarm.

## Properties

### persist

```ts
persist: boolean
```

Optional flag to enable serialization of state values to persistent storage (e.g., hard drive).

### docDescription

```ts
docDescription: string
```

Optional description for documentation purposes, aiding in state usage understanding.

### shared

```ts
shared: boolean
```

Optional flag indicating whether the state can be shared across multiple agents.

### stateName

```ts
stateName: string
```

The unique name of the state within the swarm.

### getDefaultState

```ts
getDefaultState: (clientId: string, stateName: string) => T | Promise<T>
```

Function to retrieve or compute the default state value.

### getState

```ts
getState: (clientId: string, stateName: string, defaultState: T) => T | Promise<T>
```

Optional function to retrieve the current state, with a fallback to the default state.
Overrides default state retrieval behavior if provided.

### setState

```ts
setState: (state: T, clientId: string, stateName: string) => void | Promise<void>
```

Optional function to set or update the state.
Overrides default state setting behavior if provided.

### middlewares

```ts
middlewares: IStateMiddleware<T>[]
```

Optional array of middleware functions to process the state during lifecycle operations.

### callbacks

```ts
callbacks: Partial<IStateCallbacks<T>>
```

Optional partial set of lifecycle callbacks for the state, allowing customization of state events.
