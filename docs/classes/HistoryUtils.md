# HistoryUtils

Implements `IHistoryAdapter`, `IHistoryControl`

Class representing History Utilities

## Constructor

```ts
constructor();
```

## Properties

### HistoryFactory

```ts
HistoryFactory: any
```

### HistoryCallbacks

```ts
HistoryCallbacks: any
```

### getHistory

```ts
getHistory: any
```

### useHistoryAdapter

```ts
useHistoryAdapter: (Ctor: THistoryInstanceCtor) => void
```

Use a custom history adapter.

### useHistoryCallbacks

```ts
useHistoryCallbacks: (Callbacks: Partial<IHistoryInstanceCallbacks>) => void
```

Use history lifecycle callbacks.

### push

```ts
push: (value: IModelMessage, clientId: string, agentName: string) => Promise<void>
```

Push a new message to the history.

### pop

```ts
pop: (clientId: string, agentName: string) => Promise<IModelMessage>
```

Pop the last message from the history.

### dispose

```ts
dispose: (clientId: string, agentName: string) => Promise<void>
```

Dispose of the history for a given client and agent.

## Methods

### iterate

```ts
iterate(clientId: string, agentName: AgentName): AsyncIterableIterator<IModelMessage>;
```

Iterate over the history messages.
