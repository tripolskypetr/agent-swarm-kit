# HistoryPersistInstance

Implements `IHistoryInstance`

Manages a persistent history of messages, storing them in memory and on disk.

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

### __@HISTORY_PERSIST_INSTANCE_WAIT_FOR_INIT@719

```ts
__@HISTORY_PERSIST_INSTANCE_WAIT_FOR_INIT@719: any
```

Memoized initialization function to ensure it runs only once per agent.

## Methods

### waitForInit

```ts
waitForInit(agentName: AgentName): Promise<void>;
```

Initializes the history for an agent, loading data from persistent storage if needed.

### iterate

```ts
iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
```

Iterates over history messages, applying filters and system prompts if configured.
Invokes onRead callbacks during iteration if provided.

### push

```ts
push(value: IModelMessage, agentName: AgentName): Promise<void>;
```

Adds a new message to the history, persisting it to storage.
Invokes onPush and onChange callbacks if provided.

### pop

```ts
pop(agentName: AgentName): Promise<IModelMessage | null>;
```

Removes and returns the last message from the history, updating persistent storage.
Invokes onPop and onChange callbacks if provided.

### dispose

```ts
dispose(agentName: AgentName | null): Promise<void>;
```

Disposes of the history, clearing all data if agentName is null.
Invokes onDispose callback if provided.
