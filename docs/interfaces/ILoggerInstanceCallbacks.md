# ILoggerInstanceCallbacks

Callbacks for managing logger instance lifecycle and log events.

## Methods

### onInit

```ts
onInit: (clientId: string) => void
```

Called when the logger instance is initialized.

### onDispose

```ts
onDispose: (clientId: string) => void
```

Called when the logger instance is disposed.

### onLog

```ts
onLog: (clientId: string, topic: string, ...args: any[]) => void
```

Called when a log message is recorded.

### onDebug

```ts
onDebug: (clientId: string, topic: string, ...args: any[]) => void
```

Called when a debug message is recorded.

### onInfo

```ts
onInfo: (clientId: string, topic: string, ...args: any[]) => void
```

Called when an info message is recorded.
