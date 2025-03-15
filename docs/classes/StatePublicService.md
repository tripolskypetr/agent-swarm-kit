# StatePublicService

Implements `TStateConnectionService`

Service class for managing public client-specific state operations in the swarm system, with generic type support for state data.
Implements TStateConnectionService to provide a public API for state interactions, delegating to StateConnectionService and wrapping calls with MethodContextService for context scoping.
Integrates with ClientAgent (e.g., managing client-specific state in EXECUTE_FN), PerfService (e.g., tracking sessionState per clientId), and DocService (e.g., documenting state schemas via stateName).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like setting, clearing, retrieving, and disposing client-specific state.
Contrasts with SharedStatePublicService (system-wide state) and SharedStoragePublicService (persistent storage) by scoping state to individual clients via clientId.

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
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.

### stateConnectionService

```ts
stateConnectionService: any
```

State connection service instance, injected via DI, for underlying state operations.
Provides core functionality (e.g., setState, getState) called by public methods, supporting ClientAgent’s client-specific state needs.

### setState

```ts
setState: (dispatchFn: (prevState: T) => Promise<T>, methodName: string, clientId: string, stateName: string) => Promise<T>
```

Sets the client-specific state using a provided dispatch function, updating the state identified by stateName for a given clientId.
Wraps StateConnectionService.setState with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., updating client state in EXECUTE_FN) and PerfService (e.g., tracking state changes in sessionState per client).

### clearState

```ts
clearState: (methodName: string, clientId: string, stateName: string) => Promise<T>
```

Resets the client-specific state to its initial value, identified by stateName for a given clientId.
Wraps StateConnectionService.clearState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., resetting client state in EXECUTE_FN) and PerfService (e.g., clearing sessionState for a specific client).

### getState

```ts
getState: (methodName: string, clientId: string, stateName: string) => Promise<T>
```

Retrieves the current client-specific state identified by stateName for a given clientId.
Wraps StateConnectionService.getState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., accessing client state in EXECUTE_FN) and PerfService (e.g., reading sessionState for a specific client).

### dispose

```ts
dispose: (methodName: string, clientId: string, stateName: string) => Promise<void>
```

Disposes of the client-specific state identified by stateName for a given clientId, cleaning up resources.
Wraps StateConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN) and PerfService’s dispose (e.g., clearing client-specific sessionState).
