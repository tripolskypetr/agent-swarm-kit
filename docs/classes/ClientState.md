---
title: docs/api-reference/class/ClientState
group: docs
---

# ClientState

Implements `IState<State>`, `IStateChangeContract`

Class representing the client state in the swarm system, implementing the IState interface.
Manages a single state object with queued read/write operations, middleware support, and event-driven updates via BusService.
Integrates with StateConnectionService (state instantiation), ClientAgent (state-driven behavior),
SwarmConnectionService (swarm-level state), and BusService (event emission).
 *

## Constructor

```ts
constructor(params: IStateParams<State>);
```

## Properties

### params

```ts
params: IStateParams<State>
```

### stateChanged

```ts
stateChanged: Subject<string>
```

A subject that emits state names when changes occur, allowing subscribers to react to state updates.
Provides reactive state change notifications throughout the system.

### _state

```ts
_state: State
```

The current state data, initialized as null and set during waitForInit.
Updated by setState and clearState, persisted via params.setState if provided.

### dispatch

```ts
dispatch: (action: Action, payload?: DispatchFn<State>) => Promise<State>
```

Queued dispatch function to read or write the state, delegating to DISPATCH_FN.
Ensures thread-safe state operations, supporting concurrent access from ClientAgent or tools.
   *    *

### waitForInit

```ts
waitForInit: (() => Promise<void>) & ISingleshotClearable
```

Waits for the state to initialize via WAIT_FOR_INIT_FN, ensuring it’s only called once using singleshot.
Loads the initial state into _state, supporting StateConnectionService’s lifecycle management.

## Methods

### setState

```ts
setState(dispatchFn: DispatchFn<State>): Promise<State>;
```

Sets the state using the provided dispatch function, applying middlewares and persisting via params.setState.
Invokes the onWrite callback and emits an event via BusService, supporting ClientAgent’s state updates.
   *

### clearState

```ts
clearState(): Promise<State>;
```

Resets the state to its initial value as determined by params.getState and params.getDefaultState.
Persists the result via params.setState, invokes the onWrite callback, and emits an event via BusService.
Supports resetting state for ClientAgent or swarm-level operations.

### getState

```ts
getState(): Promise<State>;
```

Retrieves the current state from _state via the dispatch queue.
Invokes the onRead callback and emits an event via BusService, supporting ClientAgent’s state queries.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the state instance, performing cleanup and invoking the onDispose callback if provided.
Ensures proper resource release with StateConnectionService when the state is no longer needed.
