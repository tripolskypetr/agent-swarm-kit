# LoggerService

Implements `ILogger`

LoggerService class that implements the ILogger interface.
Provides methods to log and debug messages.

## Constructor

```ts
constructor();
```

## Properties

### methodContextService

```ts
methodContextService: any
```

### executionContextService

```ts
executionContextService: any
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

### info

```ts
info: (...args: any[]) => void
```

Logs info messages using the current logger.

### setLogger

```ts
setLogger: (logger: ILogger) => void
```

Sets a new logger.
