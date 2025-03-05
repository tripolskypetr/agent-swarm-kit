# StatePublicService

Implements `TStateConnectionService`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### stateConnectionService

```ts
stateConnectionService: any
```

### setState

```ts
setState: (dispatchFn: (prevState: T) => Promise<T>, methodName: string, clientId: string, stateName: string) => Promise<T>
```

Sets the state using the provided dispatch function.

### clearState

```ts
clearState: (methodName: string, clientId: string, stateName: string) => Promise<T>
```

Set the state to initial value

### getState

```ts
getState: (methodName: string, clientId: string, stateName: string) => Promise<T>
```

Gets the current state.

### dispose

```ts
dispose: (methodName: string, clientId: string, stateName: string) => Promise<void>
```

Disposes the state.
