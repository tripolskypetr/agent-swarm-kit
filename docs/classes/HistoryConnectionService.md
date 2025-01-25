# HistoryConnectionService

Implements `IHistory`

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

### getHistory

```ts
getHistory: ((clientId: string, agentName: string) => ClientHistory) & IClearableMemoize<string> & IControlMemoize<string, ClientHistory>
```

### push

```ts
push: (message: IModelMessage) => Promise<void>
```

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string) => Promise<IModelMessage[]>
```

### toArrayForRaw

```ts
toArrayForRaw: () => Promise<IModelMessage[]>
```

### dispose

```ts
dispose: () => Promise<void>
```
