---
title: docs/api-reference/interface/IChatInstanceCallbacks
group: docs
---

# IChatInstanceCallbacks

## Methods

### onCheckActivity

```ts
onCheckActivity: (clientId: string, swarmName: string, isActive: boolean, lastActivity: number) => void
```

Called when checking activity status

### onInit

```ts
onInit: (clientId: string, swarmName: string, instance: IChatInstance) => void
```

Called when instance is initialized

### onDispose

```ts
onDispose: (clientId: string, swarmName: string, instance: IChatInstance) => void
```

Called when instance is disposed

### onBeginChat

```ts
onBeginChat: (clientId: string, swarmName: string) => void
```

Called when chat begins

### onSendMessage

```ts
onSendMessage: (clientId: string, swarmName: string, content: string) => void
```

Called when message is sent
