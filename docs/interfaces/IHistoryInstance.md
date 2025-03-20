# IHistoryInstance

Interface defining methods for a history instance implementation.

## Methods

### iterate

```ts
iterate: (agentName: string) => AsyncIterableIterator<IModelMessage<object>>
```

Iterates over history messages for an agent.

### waitForInit

```ts
waitForInit: (agentName: string, init: boolean) => Promise<void>
```

Initializes the history for an agent, loading initial data if needed.

### push

```ts
push: (value: IModelMessage<object>, agentName: string) => Promise<void>
```

Adds a new message to the history for an agent.

### pop

```ts
pop: (agentName: string) => Promise<IModelMessage<object>>
```

Removes and returns the last message from the history for an agent.

### dispose

```ts
dispose: (agentName: string) => Promise<void>
```

Disposes of the history for an agent, optionally clearing all data.
