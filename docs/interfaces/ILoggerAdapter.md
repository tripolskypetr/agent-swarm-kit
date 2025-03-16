# ILoggerAdapter

Interface defining methods for interacting with a logger adapter.
Implemented by LoggerUtils to provide client-specific logging operations.

## Methods

### log

```ts
log: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs a message for a client using the client-specific logger instance.
Ensures session validation and initialization before logging.

### debug

```ts
debug: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs a debug message for a client using the client-specific logger instance.
Ensures session validation and initialization before logging.

### info

```ts
info: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs an info message for a client using the client-specific logger instance.
Ensures session validation and initialization before logging.

### dispose

```ts
dispose: (clientId: string) => Promise<void>
```

Disposes of the logger instance for a client, clearing it from the cache.
Ensures initialization before disposal.
