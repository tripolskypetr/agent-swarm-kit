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
_state: State
```

### dispatch

```ts
dispatch: (action: string, payload?: DispatchFn<State>) => Promise<State>
```

### waitForInit

```ts
waitForInit: (() => Promise<void>) & ISingleshotClearable
```

Waits for the state to initialize.

## Methods

### setState

```ts
setState(dispatchFn: DispatchFn<State>): Promise<State>;
```

Sets the state using the provided dispatch function.

### clearState

```ts
clearState(): Promise<State>;
```

Sets the to initial value

### getState

```ts
getState(): Promise<State>;
```

Gets the current state.

### dispose

```ts
dispose(): void;
```

Disposes of the state.
