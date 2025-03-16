# StateConnectionService

Implements `IState<T>`

Service class for managing state connections and operations in the swarm system.
Implements IState with a generic type T extending IStateData, providing an interface for state instance management, state manipulation, and lifecycle operations, scoped to clientId and stateName.
Handles both client-specific states and delegates to SharedStateConnectionService for shared states, tracked via a _sharedStateSet.
Integrates with ClientAgent (state in agent execution), StatePublicService (public state API), SharedStateConnectionService (shared state delegation), AgentConnectionService (state initialization), and PerfService (tracking via BusService).
Uses memoization via functools-kit’s memoize to cache ClientState instances by a composite key (clientId-stateName), and queued to serialize state updates, ensuring efficient reuse and thread-safe modifications.
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StateSchemaService for state configuration, SessionValidationService for usage tracking, and SharedStateConnectionService for shared state handling.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging state operations.
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StatePublicService and PerfService logging patterns.

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
Used to retrieve clientId and stateName in method calls, integrating with MethodContextService’s scoping in StatePublicService.

### stateSchemaService

```ts
stateSchemaService: any
```

State schema service instance, injected via DI, for retrieving state configurations.
Provides configuration (e.g., persist, getState, setState) to ClientState in getStateRef, aligning with AgentMetaService’s schema management.

### sessionValidationService

```ts
sessionValidationService: any
```

Session validation service instance, injected via DI, for tracking state usage.
Used in getStateRef and dispose to manage state lifecycle, supporting SessionPublicService’s validation needs.

### sharedStateConnectionService

```ts
sharedStateConnectionService: any
```

Shared state connection service instance, injected via DI, for delegating shared state operations.
Used in getStateRef to retrieve shared states, integrating with SharedStateConnectionService’s global state management.

### _sharedStateSet

```ts
_sharedStateSet: any
```

Set of state names marked as shared, used to track delegation to SharedStateConnectionService.
Populated in getStateRef and checked in dispose to avoid disposing shared states.

### getStateRef

```ts
getStateRef: ((clientId: string, stateName: string) => ClientState<any>) & IClearableMemoize<string> & IControlMemoize<string, ClientState<any>>
```

Retrieves or creates a memoized ClientState instance for a given client and state name.
Uses functools-kit’s memoize to cache instances by a composite key (clientId-stateName), ensuring efficient reuse across calls.
Configures client-specific states with schema data from StateSchemaService, applying persistence via PersistStateAdapter or defaults from GLOBAL_CONFIG, and serializes setState with queued for thread safety.
Delegates to SharedStateConnectionService for shared states (shared=true), tracking them in _sharedStateSet.
Supports ClientAgent (state in EXECUTE_FN), AgentConnectionService (state initialization), and StatePublicService (public API).

### setState

```ts
setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>
```

Sets the state using a dispatch function that transforms the previous state.
Delegates to ClientState.setState after awaiting initialization, using context from MethodContextService to identify the state, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors StatePublicService’s setState, supporting ClientAgent’s state updates with serialized execution via queued in getStateRef.

### clearState

```ts
clearState: () => Promise<T>
```

Clears the state, resetting it to its initial value.
Delegates to ClientState.clearState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors StatePublicService’s clearState, supporting ClientAgent’s state reset with serialized execution.

### getState

```ts
getState: () => Promise<T>
```

Retrieves the current state.
Delegates to ClientState.getState after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors StatePublicService’s getState, supporting ClientAgent’s state access.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the state connection, cleaning up resources and clearing the memoized instance for client-specific states.
Checks if the state exists in the memoization cache and is not shared (via _sharedStateSet) before calling ClientState.dispose, then clears the cache and updates SessionValidationService.
Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with StatePublicService’s dispose and PerfService’s cleanup.
Shared states are not disposed here, as they are managed by SharedStateConnectionService.
