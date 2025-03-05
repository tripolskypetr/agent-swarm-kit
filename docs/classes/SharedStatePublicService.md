# SharedStatePublicService

Implements `TSharedStateConnectionService`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### sharedStateConnectionService

```ts
sharedStateConnectionService: any
```

### setState

```ts
setState: (dispatchFn: (prevState: T) => Promise<T>, methodName: string, stateName: string) => Promise<T>
```

Sets the state using the provided dispatch function.

### clearState

```ts
clearState: (methodName: string, stateName: string) => Promise<T>
```

Set the state to initial value

### getState

```ts
getState: (methodName: string, stateName: string) => Promise<T>
```

Gets the current state.
