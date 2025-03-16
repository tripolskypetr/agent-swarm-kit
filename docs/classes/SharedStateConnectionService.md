# SharedStateConnectionService

Implements `IState<T>`

Service class for managing shared state connections and operations in the swarm system.
Implements IState with a generic type T extending IStateData, providing an interface for shared state instance management, state manipulation, and state access, scoped to stateName across all clients (using a fixed clientId of "shared").
Integrates with ClientAgent (shared state in agent execution), StatePublicService (client-specific state counterpart), SharedStatePublicService (public shared state API), AgentConnectionService (state initialization), and PerfService (tracking via BusService).
Uses memoization via functools-kit’s memoize to cache ClientState instances by stateName, and queued to serialize state updates, ensuring efficient reuse and thread-safe modifications.
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StateSchemaService for state configuration, applying persistence via PersistStateAdapter or defaults from GLOBAL_CONFIG.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging shared state operations.
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SharedStatePublicService and PerfService logging patterns.

### busService

```ts
busService: any
```

Bus service instance, injected via DI, for emitting state-related events.
Passed to ClientState for event propagation (e.g., state updates), aligning with BusService’s event system in AgentConnectionService.

### methodContextService

```ts
methodContextService: any
```

Method context service instance, injected via DI, for accessing execution context.
Used to retrieve stateName in method calls, integrating with MethodContextService’s scoping in SharedStatePublicService.

### stateSchemaService

```ts
stateSchemaService: any
```

State schema service instance, injected via DI, for retrieving state configurations.
Provides configuration (e.g., persist, getState, setState) to ClientState in getStateRef, aligning with AgentMetaService’s schema management.

### getStateRef

```ts
getStateRef: ((stateName: string) => ClientState<any>) & IClearableMemoize<string> & IControlMemoize<string, ClientState<any>>
```

Retrieves or creates a memoized ClientState instance for a given shared state name.
Uses functools-kit’s memoize to cache instances by stateName, ensuring a single shared instance across all clients (fixed clientId: "shared").
Configures the state with schema data from StateSchemaService, applying persistence via PersistStateAdapter or defaults from GLOBAL_CONFIG, and enforces shared=true via an error check.
Serializes setState operations with queued if setState is provided, ensuring thread-safe updates.
Supports ClientAgent (shared state in EXECUTE_FN), AgentConnectionService (state initialization), and SharedStatePublicService (public API).

### setState

```ts
setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>
```

Sets the shared state using a dispatch function that transforms the previous state.
Delegates to ClientState.setState after awaiting initialization, using context from MethodContextService to identify the state, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SharedStatePublicService’s setState, supporting ClientAgent’s state updates with serialized execution via queued in getStateRef.

### clearState

```ts
clearState: () => Promise<T>
```

Clears the shared state, resetting it to its initial value.
Delegates to ClientState.clearState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SharedStatePublicService’s clearState, supporting ClientAgent’s state reset with serialized execution.

### getState

```ts
getState: () => Promise<T>
```

Retrieves the current shared state.
Delegates to ClientState.getState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SharedStatePublicService’s getState, supporting ClientAgent’s state access.
