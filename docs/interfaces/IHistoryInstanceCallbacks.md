# IHistoryInstanceCallbacks

Interface for History Adapter Callbacks

## Properties

### filterCondition

```ts
filterCondition: (message: IModelMessage, clientId: string, agentName: string) => boolean | Promise<boolean>
```

Filter condition for history messages.

### getData

```ts
getData: (clientId: string, agentName: string) => IModelMessage[] | Promise<IModelMessage[]>
```

Get data for the history.

### onChange

```ts
onChange: (data: IModelMessage[], clientId: string, agentName: string) => void
```

Callback for when the history changes.

### onRead

```ts
onRead: (message: IModelMessage, clientId: string, agentName: string) => void
```

Callback for when the history is read.

### onDispose

```ts
onDispose: (clientId: string) => void
```

Callback for when the history is disposed.

### onInit

```ts
onInit: (clientId: string) => void
```

Callback for when the history is initialized.
