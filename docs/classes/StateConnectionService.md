# StateConnectionService

Implements `IState<T>`

Service for managing state connections.

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

### sessionValidationService

```ts
sessionValidationService: any
```

### sharedStateConnectionService

```ts
sharedStateConnectionService: any
```

### _sharedStateSet

```ts
_sharedStateSet: any
```

### getStateRef

```ts
getStateRef: ((clientId: string, stateName: string) => ClientState<any>) & IClearableMemoize<string> & IControlMemoize<string, ClientState<any>>
```

Memoized function to get a state reference.

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

### dispose

```ts
dispose: () => Promise<void>
```

Disposes the state connection.
