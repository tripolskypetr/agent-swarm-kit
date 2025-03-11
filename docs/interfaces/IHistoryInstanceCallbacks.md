# IHistoryInstanceCallbacks

Interface for History Adapter Callbacks

## Properties

### getSystemPrompt

```ts
getSystemPrompt: (clientId: string, agentName: string) => string[] | Promise<string[]>
```

Callback for compute of dynamic system prompt

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

### onPush

```ts
onPush: (data: IModelMessage, clientId: string, agentName: string) => void
```

Callback for when the history get the new message

### onPop

```ts
onPop: (data: IModelMessage, clientId: string, agentName: string) => void
```

Callback for when the history pop the last message

### onRead

```ts
onRead: (message: IModelMessage, clientId: string, agentName: string) => void
```

Callback for when the history is read. Will be called for each message

### onReadBegin

```ts
onReadBegin: (clientId: string, agentName: string) => void
```

Callback for when the read is begin

### onReadEnd

```ts
onReadEnd: (clientId: string, agentName: string) => void
```

Callback for when the read is end

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

### onRef

```ts
onRef: (history: HistoryInstance) => void
```

Callback to obtain history ref
