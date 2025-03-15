# ILoggerInstance

Interface for logger instances, extending the base ILogger with lifecycle methods.

## Methods

### waitForInit

```ts
waitForInit: (initial: boolean) => void | Promise<void>
```

Initializes the logger instance, optionally waiting for setup.

### dispose

```ts
dispose: () => void | Promise<void>
```

Disposes of the logger instance, cleaning up resources.
