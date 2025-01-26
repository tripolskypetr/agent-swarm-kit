# IHistory

Interface representing the history of model messages.

## Methods

### push

```ts
push: (message: IModelMessage) => Promise<void>
```

Pushes a message to the history.

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string) => Promise<IModelMessage[]>
```

Converts the history to an array of messages for a specific agent.

### toArrayForRaw

```ts
toArrayForRaw: () => Promise<IModelMessage[]>
```

Converts the history to an array of raw messages.
