# ILoggerControl

Interface defining control methods for configuring logger behavior.

## Methods

### useCommonAdapter

```ts
useCommonAdapter: (logger: ILogger) => void
```

Sets a common logger adapter for all logging operations.

### useClientCallbacks

```ts
useClientCallbacks: (Callbacks: Partial<ILoggerInstanceCallbacks>) => void
```

Configures client-specific lifecycle callbacks for logger instances.

### useClientAdapter

```ts
useClientAdapter: (Ctor: TLoggerInstanceCtor) => void
```

Sets a custom logger instance constructor for client-specific logging.

### logClient

```ts
logClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs a message for a specific client using the common adapter.

### infoClient

```ts
infoClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs an info message for a specific client using the common adapter.

### debugClient

```ts
debugClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs a debug message for a specific client using the common adapter.
