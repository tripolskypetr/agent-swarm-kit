# IStateSchema

Schema for state management.

## Properties

### persist

```ts
persist: boolean
```

Mark the state to serialize values to the hard drive

### docDescription

```ts
docDescription: string
```

The description for documentation

### shared

```ts
shared: boolean
```

The agents can share the state

### stateName

```ts
stateName: string
```

The name of the state.

### getDefaultState

```ts
getDefaultState: (clientId: string, stateName: string) => T | Promise<T>
```

The default value for a state

### getState

```ts
getState: (clientId: string, stateName: string, defaultState: T) => T | Promise<T>
```

Gets the state.

### setState

```ts
setState: (state: T, clientId: string, stateName: string) => void | Promise<void>
```

Sets the state.

### middlewares

```ts
middlewares: IStateMiddleware<T>[]
```

Middleware functions for state management.

### callbacks

```ts
callbacks: Partial<IStateCallbacks<T>>
```

Callbacks for state lifecycle events.
