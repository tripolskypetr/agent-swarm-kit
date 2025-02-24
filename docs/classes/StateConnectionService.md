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

### contextService

```ts
contextService: any
```

### stateSchemaService

```ts
stateSchemaService: any
```

### sessionValidationService

```ts
sessionValidationService: any
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
