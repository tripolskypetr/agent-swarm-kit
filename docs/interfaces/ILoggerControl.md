# ILoggerControl

## Methods

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
