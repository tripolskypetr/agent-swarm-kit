# HistoryPublicService

Implements `THistoryConnectionService`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### historyConnectionService

```ts
historyConnectionService: any
```

### push

```ts
push: (message: IModelMessage, clientId: string, agentName: string) => Promise<void>
```

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string, clientId: string, agentName: string) => Promise<IModelMessage[]>
```

### toArrayForRaw

```ts
toArrayForRaw: (clientId: string, agentName: string) => Promise<IModelMessage[]>
```

### dispose

```ts
dispose: (clientId: string, agentName: string) => Promise<void>
```
