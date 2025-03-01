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

### _commonLogger

```ts
_commonLogger: any
```

### getLoggerAdapter

```ts
getLoggerAdapter: any
```

Creates the client logs adapter using factory

### log

```ts
log: (topic: string, ...args: any[]) => void
```

Logs messages using the current logger.

### debug

```ts
debug: (topic: string, ...args: any[]) => void
```

Logs debug messages using the current logger.

### info

```ts
info: (topic: string, ...args: any[]) => void
```

Logs info messages using the current logger.

### setLogger

```ts
setLogger: (logger: ILogger) => void
```

Sets a new logger.
