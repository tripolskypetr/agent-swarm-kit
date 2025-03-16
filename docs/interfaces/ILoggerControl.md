# ILoggerControl

Interface defining control methods for configuring logger behavior.
Implemented by LoggerUtils to manage common adapters, callbacks, and custom constructors.

## Methods

### useCommonAdapter

```ts
useCommonAdapter: (logger: ILogger) => void
```

Sets a common logger adapter for all logging operations via swarm.loggerService.
Overrides the default logger service behavior for centralized logging.

### useClientCallbacks

```ts
useClientCallbacks: (Callbacks: Partial<ILoggerInstanceCallbacks>) => void
```

Configures client-specific lifecycle callbacks for logger instances.
Applies to all instances created by LoggerUtils’ LoggerFactory.

### useClientAdapter

```ts
useClientAdapter: (Ctor: TLoggerInstanceCtor) => void
```

Sets a custom logger instance constructor for client-specific logging.
Replaces the default LoggerInstance with a user-defined constructor.

### logClient

```ts
logClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs a message for a specific client using the common adapter (swarm.loggerService).
Includes session validation and method context tracking.

### infoClient

```ts
infoClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs an info message for a specific client using the common adapter (swarm.loggerService).
Includes session validation and method context tracking.

### debugClient

```ts
debugClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs a debug message for a specific client using the common adapter (swarm.loggerService).
Includes session validation and method context tracking.
