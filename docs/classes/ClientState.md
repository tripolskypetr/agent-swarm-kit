# ClientState

Implements `IState<State>`

Class representing the client state, managing state data with read/write operations.

## Constructor

```ts
constructor(params: IStateParams<State>);
```

## Properties

### params

```ts
params: IStateParams<State>
```

### _state

```ts
_state: State
```

The current state data, initialized as null and set during waitForInit.

### dispatch

```ts
dispatch: (action: string, payload?: DispatchFn<State>) => Promise<State>
```

Queued dispatch function to read or write the state.

### waitForInit

```ts
waitForInit: (() => Promise<void>) & ISingleshotClearable
```

Waits for the state to initialize, ensuring it’s only called once.
Uses singleshot to prevent multiple initializations.

## Methods

### setState

```ts
setState(dispatchFn: DispatchFn<State>): Promise<State>;
```

Sets the state using the provided dispatch function, applying middlewares and persisting the result.
Invokes the onWrite callback and emits an event if configured.

### clearState

```ts
clearState(): Promise<State>;
```

Resets the state to its initial value as determined by getState and getDefaultState.
Persists the result and invokes the onWrite callback if configured.

### getState

```ts
getState(): Promise<State>;
```

Retrieves the current state.
Invokes the onRead callback and emits an event if configured.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the state, performing cleanup and invoking the onDispose callback if provided.
