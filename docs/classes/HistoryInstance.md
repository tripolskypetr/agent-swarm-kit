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

### waitForInit

```ts
waitForInit: ((agentName: string) => Promise<void>) & ISingleshotClearable
```

Wait for the history to initialize.

### push

```ts
push: (value: IModelMessage, agentName: string) => Promise<void>
```

Push a new message to the history for a given agent.

### dispose

```ts
dispose: (agentName: string) => Promise<void>
```

Dispose of the history for a given agent.

## Methods

### iterate

```ts
iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;
```

Iterate over the history messages for a given agent.
