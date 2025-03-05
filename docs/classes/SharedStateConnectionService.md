# SharedStateConnectionService

Implements `IState<T>`

Service for managing shared state connections.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### busService

```ts
busService: any
```

### methodContextService

```ts
methodContextService: any
```

### stateSchemaService

```ts
stateSchemaService: any
```

### getStateRef

```ts
getStateRef: ((stateName: string) => ClientState<any>) & IClearableMemoize<string> & IControlMemoize<string, ClientState<any>>
```

Memoized function to get a shared state reference.

### setState

```ts
setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>
```

Sets the state.

### clearState

```ts
clearState: () => Promise<T>
```

Set the state to initial value

### getState

```ts
getState: () => Promise<T>
```

Gets the state.
