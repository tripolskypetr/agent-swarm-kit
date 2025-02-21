# IHistoryInstance

Interface for History Instance

## Methods

### iterate

```ts
iterate: (agentName: string) => AsyncIterableIterator<IModelMessage>
```

Iterate over the history messages for a given agent.

### waitForInit

```ts
waitForInit: (agentName: string, init: boolean) => Promise<void>
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
