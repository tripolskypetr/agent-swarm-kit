---
title: docs/api-reference/interface/IHistoryInstanceCallbacks
group: docs
---

# IHistoryInstanceCallbacks

Callbacks for managing history instance lifecycle and message handling.

## Properties

### getSystemPrompt

```ts
getSystemPrompt: (clientId: string, agentName: string) => string[] | Promise<string[]>
```

Retrieves dynamic system prompt messages for an agent.

### filterCondition

```ts
filterCondition: (message: ISwarmMessage<object>, clientId: string, agentName: string) => boolean | Promise<boolean>
```

Determines whether a message should be included in the history iteration.

### getData

```ts
getData: (clientId: string, agentName: string) => ISwarmMessage<object>[] | Promise<ISwarmMessage<object>[]>
```

Fetches initial history data for an agent.

### onChange

```ts
onChange: (data: ISwarmMessage<object>[], clientId: string, agentName: string) => void
```

Called when the history array changes (e.g., after push or pop).

### onPush

```ts
onPush: (data: ISwarmMessage<object>, clientId: string, agentName: string) => void
```

Called when a new message is pushed to the history.

### onPop

```ts
onPop: (data: ISwarmMessage<object>, clientId: string, agentName: string) => void
```

Called when the last message is popped from the history.

### onRead

```ts
onRead: (message: ISwarmMessage<object>, clientId: string, agentName: string) => void
```

Called for each message during iteration when reading.

### onReadBegin

```ts
onReadBegin: (clientId: string, agentName: string) => void
```

Called at the start of a history read operation.

### onReadEnd

```ts
onReadEnd: (clientId: string, agentName: string) => void
```

Called at the end of a history read operation.

### onDispose

```ts
onDispose: (clientId: string) => void
```

Called when the history instance is disposed.

### onInit

```ts
onInit: (clientId: string) => void
```

Called when the history instance is initialized.

### onRef

```ts
onRef: (history: IHistoryInstance) => void
```

Provides a reference to the history instance after creation.
