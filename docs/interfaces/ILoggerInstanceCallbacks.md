# ILoggerInstanceCallbacks

Callbacks for managing logger instance lifecycle and log events.
Used by LoggerInstance to hook into initialization, disposal, and logging operations.

## Methods

### onInit

```ts
onInit: (clientId: string) => void
```

Called when the logger instance is initialized, typically during waitForInit.

### onDispose

```ts
onDispose: (clientId: string) => void
```

Called when the logger instance is disposed, cleaning up resources.

### onLog

```ts
onLog: (clientId: string, topic: string, ...args: any[]) => void
```

Called when a log message is recorded via the log method.

### onDebug

```ts
onDebug: (clientId: string, topic: string, ...args: any[]) => void
```

Called when a debug message is recorded via the debug method.

### onInfo

```ts
onInfo: (clientId: string, topic: string, ...args: any[]) => void
```

Called when an info message is recorded via the info method.
