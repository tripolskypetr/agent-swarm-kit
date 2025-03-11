# IHistoryAdapter

Interface for History Adapter

## Properties

### push

```ts
push: (value: IModelMessage, clientId: string, agentName: string) => Promise<void>
```

Push a new message to the history.

### pop

```ts
pop: (clientId: string, agentName: string) => Promise<IModelMessage>
```

Pop the last message from a history

### dispose

```ts
dispose: (clientId: string, agentName: string) => Promise<void>
```

Dispose of the history for a given client and agent.

## Methods

### iterate

```ts
iterate: (clientId: string, agentName: string) => AsyncIterableIterator<IModelMessage>
```

Iterate over the history messages.
