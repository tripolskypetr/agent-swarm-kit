# HistoryMemoryInstance

Implements `IHistoryInstance`

Manages an in-memory history of messages without persistence.

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

### __@HISTORY_MEMORY_INSTANCE_WAIT_FOR_INIT@761

```ts
__@HISTORY_MEMORY_INSTANCE_WAIT_FOR_INIT@761: any
```

Memoized initialization function to ensure it runs only once per agent.

## Methods

### waitForInit

```ts
waitForInit(agentName: AgentName): Promise<void>;
```

Initializes the history for an agent, loading initial data if needed.

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

Adds a new message to the in-memory history.
Invokes onPush and onChange callbacks if provided.

### pop

```ts
pop(agentName: AgentName): Promise<IModelMessage | null>;
```

Removes and returns the last message from the in-memory history.
Invokes onPop and onChange callbacks if provided.

### dispose

```ts
dispose(agentName: AgentName | null): Promise<void>;
```

Disposes of the history, clearing all data if agentName is null.
Invokes onDispose callback if provided.
