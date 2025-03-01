# LoggerUtils

Implements `ILoggerAdapter`, `ILoggerControl`

## Constructor

```ts
constructor();
```

## Properties

### LoggerFactory

```ts
LoggerFactory: any
```

### LoggerCallbacks

```ts
LoggerCallbacks: any
```

### getLogger

```ts
getLogger: any
```

### useCommonAdapter

```ts
useCommonAdapter: (logger: ILogger) => void
```

### useClientCallbacks

```ts
useClientCallbacks: (Callbacks: Partial<ILoggerInstanceCallbacks>) => void
```

### useClientAdapter

```ts
useClientAdapter: (Ctor: TLoggerInstanceCtor) => void
```

### logClient

```ts
logClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

### infoClient

```ts
infoClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

### debugClient

```ts
debugClient: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

### log

```ts
log: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

### debug

```ts
debug: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

### info

```ts
info: (clientId: string, topic: string, ...args: any[]) => Promise<void>
```

### dispose

```ts
dispose: (clientId: string) => Promise<void>
```
