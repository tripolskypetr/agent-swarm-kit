# LoggerService

Implements `ILogger`

LoggerService class that implements the ILogger interface.
Provides methods to log and debug messages.

## Constructor

```ts
constructor();
```

## Properties

### contextService

```ts
contextService: any
```

### _logger

```ts
_logger: any
```

### log

```ts
log: (...args: any[]) => void
```

Logs messages using the current logger.

### debug

```ts
debug: (...args: any[]) => void
```

Logs debug messages using the current logger.

### setLogger

```ts
setLogger: (logger: ILogger) => void
```

Sets a new logger.
