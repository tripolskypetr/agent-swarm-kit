# ClientHistory

Implements `IHistory`

## Constructor

```ts
constructor(params: IHistoryParams);
```

## Properties

### params

```ts
params: IHistoryParams
```

### push

```ts
push: (message: IModelMessage) => Promise<void>
```

### toArrayForRaw

```ts
toArrayForRaw: () => Promise<IModelMessage[]>
```

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string) => Promise<IModelMessage[]>
```
