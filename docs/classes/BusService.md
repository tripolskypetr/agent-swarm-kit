---
title: docs/api-reference/class/BusService
group: docs
---

# BusService

Implements `IBus`

Service class implementing the IBus interface to manage event subscriptions and emissions in the swarm system.
Provides methods to subscribe to events (subscribe, once), emit events (emit, commitExecutionBegin, commitExecutionEnd), and dispose of subscriptions (dispose), using a memoized Subject per clientId and EventSource.
Integrates with ClientAgent (e.g., execution events in EXECUTE_FN), PerfService (e.g., execution tracking via emit), and DocService (e.g., performance logging), leveraging LoggerService for info-level logging and SessionValidationService for session validation.
Supports wildcard subscriptions (clientId="*") and execution-specific event aliases, enhancing event-driven communication across the system.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging bus operations.
Used in methods like subscribe, emit, and dispose when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with PerfService and DocService logging patterns.

### sessionValidationService

```ts
sessionValidationService: any
```

Session validation service instance, injected via DI, for checking active client sessions.
Used in emit to ensure events are only emitted for valid sessions, aligning with ClientAgent’s session management (e.g., clientId validation).

### _eventSourceSet

```ts
_eventSourceSet: any
```

Set of registered event sources, tracking all unique EventSource values from subscriptions.
Used in dispose to clean up subscriptions for a clientId, ensuring comprehensive resource management.

### _eventWildcardMap

```ts
_eventWildcardMap: any
```

Map indicating wildcard subscriptions (clientId="*") for each EventSource.
Used in emit to broadcast events to wildcard subscribers, enhancing flexibility in event handling (e.g., system-wide monitoring).

### getEventSubject

```ts
getEventSubject: any
```

Memoized factory function to create or retrieve a Subject for a clientId and EventSource pair.
Uses memoize from functools-kit with a key of `${clientId}-${source}`, optimizing performance by reusing Subjects, integral to subscribe, once, and emit operations.

### subscribe

```ts
subscribe: <T extends IBaseEvent>(clientId: string, source: string, fn: (event: T) => void) => () => void
```

Subscribes to events for a specific client and event source, invoking the callback for each matching event.
Registers the source in _eventSourceSet and supports wildcard subscriptions (clientId="*") via _eventWildcardMap, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., to monitor execution events) and PerfService (e.g., to track execution metrics indirectly via events).

### once

```ts
once: <T extends IBaseEvent>(clientId: string, source: string, filterFn: (event: T) => boolean, fn: (event: T) => void) => () => void
```

Subscribes to a single event for a specific client and event source, invoking the callback once when the filter condition is met.
Registers the source in _eventSourceSet and supports wildcard subscriptions, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Useful for one-time event handling (e.g., ClientAgent awaiting execution completion), complementing subscribe.

### emit

```ts
emit: <T extends IBaseEvent>(clientId: string, event: T) => Promise<void>
```

Emits an event for a specific client, broadcasting to subscribers of the event’s source, including wildcard subscribers.
Validates the client session with SessionValidationService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, and supports PerfService execution tracking (e.g., via commitExecutionBegin).

### commitExecutionBegin

```ts
commitExecutionBegin: (clientId: string, context: Partial<IBusEventContext>) => Promise<void>
```

Emits an execution begin event for a specific client, serving as an alias for emit with a predefined IBusEvent structure.
Logs via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used in ClientAgent (e.g., EXECUTE_FN start) and PerfService (e.g., startExecution trigger).

### commitExecutionEnd

```ts
commitExecutionEnd: (clientId: string, context: Partial<IBusEventContext>) => Promise<void>
```

Emits an execution end event for a specific client, serving as an alias for emit with a predefined IBusEvent structure.
Logs via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used in ClientAgent (e.g., EXECUTE_FN completion) and PerfService (e.g., endExecution trigger).

### dispose

```ts
dispose: (clientId: string) => void
```

Disposes of all event subscriptions for a specific client, unsubscribing and clearing Subjects for all registered sources.
Logs via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with PerfService’s dispose (e.g., session cleanup) and ClientAgent’s session termination.
