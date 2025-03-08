# HistoryInstance

Implements `IHistoryInstance`

Class representing a History Instance

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
_array: any
```

### __@HISTORY_INSTANCE_WAIT_FOR_INIT@441

```ts
__@HISTORY_INSTANCE_WAIT_FOR_INIT@441: any
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

### dispose

```ts
dispose(agentName: AgentName | null): Promise<void>;
```

Dispose of the history for a given agent.
