---
title: docs/api-reference/interface/IOperatorInstanceCallbacks
group: docs
---

# IOperatorInstanceCallbacks

Callbacks interface for OperatorInstance events

## Properties

### onInit

```ts
onInit: (clientId: string, agentName: string) => void
```

Called when operator instance is initialized

### onAnswer

```ts
onAnswer: (answer: string, clientId: string, agentName: string) => void
```

Called when operator provides an answer

### onMessage

```ts
onMessage: (message: string, clientId: string, agentName: string) => void
```

Called when operator receives a message

### onDispose

```ts
onDispose: (clientId: string, agentName: string) => void
```

Called when operator instance is disposed

### onNotify

```ts
onNotify: (answer: string, clientId: string, agentName: string) => void
```

Called when operator sends a notification
