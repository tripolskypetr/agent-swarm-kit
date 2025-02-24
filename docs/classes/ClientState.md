# ClientState

Implements `IState<State>`

Class representing the client state.

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
_state: any
```

### dispatch

```ts
dispatch: any
```

### waitForInit

```ts
waitForInit: (() => Promise<void>) & ISingleshotClearable
```

Waits for the state to initialize.

### setState

```ts
setState: (dispatchFn: DispatchFn<State>) => Promise<State>
```

Sets the state using the provided dispatch function.

### getState

```ts
getState: () => Promise<State>
```

Gets the current state.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the state.
