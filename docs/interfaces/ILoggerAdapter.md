# ILoggerAdapter

Interface defining methods for interacting with a logger adapter.

## Methods

### log

```ts
log: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs a message for a client.

### debug

```ts
debug: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs a debug message for a client.

### info

```ts
info: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

Logs an info message for a client.

### dispose

```ts
dispose: (clientId: string) => Promise<void>
```

Disposes of the logger instance for a client.
