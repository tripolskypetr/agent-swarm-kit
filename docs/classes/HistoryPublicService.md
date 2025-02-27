# HistoryPublicService

Implements `THistoryConnectionService`

Service for handling public history operations.

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
push: (message: IModelMessage, requestId: string, clientId: string, agentName: string) => Promise<void>
```

Pushes a message to the history.

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string, requestId: string, clientId: string, agentName: string) => Promise<IModelMessage[]>
```

Converts history to an array for a specific agent.

### toArrayForRaw

```ts
toArrayForRaw: (requestId: string, clientId: string, agentName: string) => Promise<IModelMessage[]>
```

Converts history to a raw array.

### dispose

```ts
dispose: (requestId: string, clientId: string, agentName: string) => Promise<void>
```

Disposes of the history.
