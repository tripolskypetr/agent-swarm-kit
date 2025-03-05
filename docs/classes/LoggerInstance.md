# LoggerInstance

Implements `ILoggerInstance`

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

### __@LOGGER_INSTANCE_WAIT_FOR_INIT@1904

```ts
__@LOGGER_INSTANCE_WAIT_FOR_INIT@1904: any
```

## Methods

### waitForInit

```ts
waitForInit(): Promise<void>;
```

### log

```ts
log(topic: string, ...args: any[]): void;
```

Logs a message.

### debug

```ts
debug(topic: string, ...args: any[]): void;
```

Logs a debug message.

### info

```ts
info(topic: string, ...args: any[]): void;
```

Logs a info message.

### dispose

```ts
dispose(): void;
```
