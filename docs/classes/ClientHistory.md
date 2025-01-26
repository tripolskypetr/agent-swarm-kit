# ClientHistory

Implements `IHistory`

Class representing the history of client messages.

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

Pushes a message to the history.

### toArrayForRaw

```ts
toArrayForRaw: () => Promise<IModelMessage[]>
```

Converts the history to an array of raw messages.

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string) => Promise<IModelMessage[]>
```

Converts the history to an array of messages for the agent.
