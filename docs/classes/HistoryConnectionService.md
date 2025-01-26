# HistoryConnectionService

Implements `IHistory`

Service for managing history connections.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### contextService

```ts
contextService: any
```

### sessionValidationService

```ts
sessionValidationService: any
```

### getItems

```ts
getItems: ((clientId: string, agentName: string) => IPubsubArray<IModelMessage>) & IClearableMemoize<string> & IControlMemoize<string, IPubsubArray<IModelMessage>>
```

Retrieves items for a given client and agent.

### getHistory

```ts
getHistory: ((clientId: string, agentName: string) => ClientHistory) & IClearableMemoize<string> & IControlMemoize<string, ClientHistory>
```

Retrieves the history for a given client and agent.

### push

```ts
push: (message: IModelMessage) => Promise<void>
```

Pushes a message to the history.

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string) => Promise<IModelMessage[]>
```

Converts the history to an array for the agent.

### toArrayForRaw

```ts
toArrayForRaw: () => Promise<IModelMessage[]>
```

Converts the history to a raw array.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the history connection service.
