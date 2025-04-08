---
title: docs/api-reference/class/LoggerService
group: docs
---

# LoggerService

Implements `ILogger`

Service class implementing the ILogger interface to provide logging functionality in the swarm system.
Handles log, debug, and info messages with context awareness using MethodContextService and ExecutionContextService, routing logs to both a client-specific logger (via GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER) and a common logger.
Integrates with ClientAgent (e.g., debug logging in RUN_FN), PerfService (e.g., info logging in startExecution), and DocService (e.g., info logging in dumpDocs), controlled by GLOBAL_CONFIG logging flags (e.g., CC_LOGGER_ENABLE_DEBUG).
Supports runtime logger replacement via setLogger, enhancing flexibility across the system.

## Constructor

```ts
constructor();
```

## Properties

### methodContextService

```ts
methodContextService: any
```

Method context service instance, injected via DI, providing method-level context (e.g., clientId).
Used in log, debug, and info to attach method-specific metadata, aligning with ClientAgent’s method execution context.

### executionContextService

```ts
executionContextService: any
```

Execution context service instance, injected via DI, providing execution-level context (e.g., clientId).
Used in log, debug, and info to attach execution-specific metadata, complementing ClientAgent’s execution workflows (e.g., EXECUTE_FN).

### _commonLogger

```ts
_commonLogger: any
```

The common logger instance, defaults to NOOP_LOGGER, used for system-wide logging.
Updated via setLogger, receives all log messages alongside client-specific loggers, ensuring a fallback logging mechanism.

### getLoggerAdapter

```ts
getLoggerAdapter: any
```

Factory function to create a client-specific logger adapter, memoized with singleshot for efficiency.
Sources from GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER (defaults to LoggerAdapter), used in log, debug, and info to route client-specific logs (e.g., ClientAgent’s clientId).

### log

```ts
log: (topic: string, ...args: any[]) => Promise<void>
```

Logs messages at the normal level, routing to both the client-specific logger (if clientId exists) and the common logger.
Attaches method and execution context (e.g., clientId) for traceability, used across the system (e.g., PerfService’s dispose).
Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG, defaults to enabled.

### debug

```ts
debug: (topic: string, ...args: any[]) => Promise<void>
```

Logs messages at the debug level, routing to both the client-specific logger (if clientId exists) and the common logger.
Attaches method and execution context for detailed debugging, heavily used in ClientAgent (e.g., RUN_FN, EXECUTE_FN) when GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG is true.

### info

```ts
info: (topic: string, ...args: any[]) => Promise<void>
```

Logs messages at the info level, routing to both the client-specific logger (if clientId exists) and the common logger.
Attaches method and execution context for informational tracking, used in PerfService (e.g., startExecution) and DocService (e.g., dumpDocs) when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.

### setLogger

```ts
setLogger: (logger: ILogger) => void
```

Sets a new common logger instance, replacing the default NOOP_LOGGER or previous logger.
Allows runtime customization of system-wide logging behavior, potentially used in testing or advanced configurations (e.g., redirecting logs to a file or console).
