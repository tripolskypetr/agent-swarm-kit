---
title: docs/api-reference/class/ChatInstance
group: docs
---

# ChatInstance

Implements `IChatInstance`

## Constructor

```ts
constructor(clientId: string, swarmName: string, onDispose: DisposeFn, callbacks: Partial<IChatInstanceCallbacks>, payload: Payload);
```

## Properties

### clientId

```ts
clientId: string
```

### swarmName

```ts
swarmName: string
```

### onDispose

```ts
onDispose: DisposeFn
```

### callbacks

```ts
callbacks: Partial<IChatInstanceCallbacks>
```

### payload

```ts
payload: Payload
```

### _disposeSubject

```ts
_disposeSubject: Subject<string>
```

### _chatSession

```ts
_chatSession: { complete: (content: string, payload?: object) => Promise<string>; dispose: () => Promise<void>; }
```

### _lastActivity

```ts
_lastActivity: number
```

### beginChat

```ts
beginChat: (() => Promise<void>) & ISingleshotClearable
```

Begins a chat session

## Methods

### checkLastActivity

```ts
checkLastActivity(now: number): Promise<boolean>;
```

Checks if the chat has been active within the timeout period

### sendMessage

```ts
sendMessage(content: string): Promise<string>;
```

Sends a message in the chat

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the chat instance

### listenDispose

```ts
listenDispose(fn: (clientId: SessionId) => void): () => void;
```

Adds a listener for dispose events
