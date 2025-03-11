# IHistory

Interface representing the history of model messages.

## Methods

### push

```ts
push: (message: IModelMessage) => Promise<void>
```

Pushes a message to the history.

### pop

```ts
pop: () => Promise<IModelMessage>
```

Pop the last message from a history

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string, system?: string[]) => Promise<IModelMessage[]>
```

Converts the history to an array of messages for a specific agent.

### toArrayForRaw

```ts
toArrayForRaw: () => Promise<IModelMessage[]>
```

Converts the history to an array of raw messages.
