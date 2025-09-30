---
title: docs/api-reference/class/SharedStatePublicService
group: docs
---

# SharedStatePublicService

Implements `TSharedStateConnectionService`

Service class for managing public shared state operations in the swarm system, with generic type support for state data.
Implements TSharedStateConnectionService to provide a public API for shared state interactions, delegating to SharedStateConnectionService and wrapping calls with MethodContextService for context scoping.
Integrates with PerfService (e.g., sessionState tracking in computeClientState), ClientAgent (e.g., state management in EXECUTE_FN), and DocService (e.g., documenting state schemas via stateName).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like setting, clearing, and retrieving shared state across the system.

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
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.

### sharedStateConnectionService

```ts
sharedStateConnectionService: any
```

Shared state connection service instance, injected via DI, for underlying state operations.
Provides core functionality (e.g., setState, getState) called by public methods, supporting ClientAgent’s state management needs.

### setState

```ts
setState: (dispatchFn: (prevState: T) => Promise<T>, methodName: string, stateName: string) => Promise<T>
```

Sets the shared state using a provided dispatch function, updating the state identified by stateName.
Wraps SharedStateConnectionService.setState with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., updating state in EXECUTE_FN) and PerfService (e.g., tracking state changes in sessionState).

### clearState

```ts
clearState: (methodName: string, stateName: string) => Promise<T>
```

Resets the shared state to its initial value, identified by stateName.
Wraps SharedStateConnectionService.clearState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., resetting state in EXECUTE_FN) and PerfService (e.g., clearing sessionState for performance resets).

### getState

```ts
getState: (methodName: string, stateName: string) => Promise<T>
```

Retrieves the current shared state identified by stateName.
Wraps SharedStateConnectionService.getState with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., accessing state in EXECUTE_FN) and PerfService (e.g., reading sessionState for metrics).
