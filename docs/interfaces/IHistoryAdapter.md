# IHistoryAdapter

Interface defining methods for interacting with a history adapter.

## Properties

### push

```ts
push: (value: IModelMessage, clientId: string, agentName: string) => Promise<void>
```

Adds a new message to the history.

### pop

```ts
pop: (clientId: string, agentName: string) => Promise<IModelMessage>
```

Removes and returns the last message from the history.

### dispose

```ts
dispose: (clientId: string, agentName: string) => Promise<void>
```

Disposes of the history for a client and agent, optionally clearing all data.

## Methods

### iterate

```ts
iterate: (clientId: string, agentName: string) => AsyncIterableIterator<IModelMessage>
```

Iterates over history messages for a client and agent.
