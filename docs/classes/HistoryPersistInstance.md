# HistoryPersistInstance

Implements `IHistoryInstance`

Class representing a persistent history instance.
This class implements the IHistoryInstance interface and provides methods
to manage and persist history messages.

## Constructor

```ts
constructor(clientId: string, callbacks: Partial<IHistoryInstanceCallbacks>);
```

## Properties

### clientId

```ts
clientId: string
```

### callbacks

```ts
callbacks: Partial<IHistoryInstanceCallbacks>
```

### _array

```ts
_array: IModelMessage[]
```

### _persistStorage

```ts
_persistStorage: PersistList<string>
```

### __@HISTORY_PERSIST_INSTANCE_WAIT_FOR_INIT@653

```ts
__@HISTORY_PERSIST_INSTANCE_WAIT_FOR_INIT@653: any
```

Makes the singleshot for initialization

## Methods

### waitForInit

```ts
waitForInit(agentName: AgentName): Promise<void>;
```

Wait for the history to initialize.

### iterate

```ts
iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
```

Iterate over the history messages for a given agent.

### push

```ts
push(value: IModelMessage, agentName: AgentName): Promise<void>;
```

Push a new message to the history for a given agent.

### pop

```ts
pop(agentName: AgentName): Promise<IModelMessage>;
```

Pop the last message from the history for a given agent.

### dispose

```ts
dispose(agentName: AgentName | null): Promise<void>;
```

Dispose of the history for a given agent.
