# LoggerInstance

Implements `ILoggerInstance`

Manages logging operations for a specific client, with customizable callbacks and console output.
Implements ILoggerInstance for client-specific logging with lifecycle management.
Integrates with GLOBAL_CONFIG for console logging control and callbacks for custom behavior.

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

### __@LOGGER_INSTANCE_WAIT_FOR_INIT@2410

```ts
__@LOGGER_INSTANCE_WAIT_FOR_INIT@2410: any
```

Memoized initialization function to ensure it runs only once using singleshot.
Invokes LOGGER_INSTANCE_WAIT_FOR_FN to handle onInit callback execution.

## Methods

### waitForInit

```ts
waitForInit(): Promise<void>;
```

Initializes the logger instance, invoking the onInit callback if provided.
Ensures initialization is performed only once, memoized via singleshot.

### log

```ts
log(topic: string, ...args: any[]): void;
```

Logs a message to the console (if enabled) and invokes the onLog callback if provided.
Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE for console output.

### debug

```ts
debug(topic: string, ...args: any[]): void;
```

Logs a debug message to the console (if enabled) and invokes the onDebug callback if provided.
Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE for console output.

### info

```ts
info(topic: string, ...args: any[]): void;
```

Logs an info message to the console (if enabled) and invokes the onInfo callback if provided.
Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE for console output.

### dispose

```ts
dispose(): void;
```

Disposes of the logger instance, invoking the onDispose callback if provided.
Performs synchronous cleanup without additional resource management.
