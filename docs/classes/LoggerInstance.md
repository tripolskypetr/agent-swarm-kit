# LoggerInstance

Implements `ILoggerInstance`

Manages logging operations for a specific client, with customizable callbacks.

## Constructor

```ts
constructor(clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>);
```

## Properties

### clientId

```ts
clientId: string
```

### callbacks

```ts
callbacks: Partial<ILoggerInstanceCallbacks>
```

### __@LOGGER_INSTANCE_WAIT_FOR_INIT@2471

```ts
__@LOGGER_INSTANCE_WAIT_FOR_INIT@2471: any
```

Memoized initialization function to ensure it runs only once.

## Methods

### waitForInit

```ts
waitForInit(): Promise<void>;
```

Initializes the logger instance, invoking the onInit callback if provided.

### log

```ts
log(topic: string, ...args: any[]): void;
```

Logs a message to the console (if enabled) and invokes the onLog callback.

### debug

```ts
debug(topic: string, ...args: any[]): void;
```

Logs a debug message to the console (if enabled) and invokes the onDebug callback.

### info

```ts
info(topic: string, ...args: any[]): void;
```

Logs an info message to the console (if enabled) and invokes the onInfo callback.

### dispose

```ts
dispose(): void;
```

Disposes of the logger instance, invoking the onDispose callback if provided.
