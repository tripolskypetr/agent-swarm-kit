# ILoggerInstance

Interface for logger instances, extending the base ILogger with lifecycle methods.
Implemented by LoggerInstance for client-specific logging with initialization and disposal support.

## Methods

### waitForInit

```ts
waitForInit: (initial: boolean) => void | Promise<void>
```

Initializes the logger instance, invoking the onInit callback if provided.
Ensures initialization is performed only once, supporting asynchronous setup.

### dispose

```ts
dispose: () => void | Promise<void>
```

Disposes of the logger instance, invoking the onDispose callback if provided.
Cleans up resources associated with the client ID.
