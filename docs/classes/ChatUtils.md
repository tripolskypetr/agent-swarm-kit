---
title: docs/api-reference/class/ChatUtils
group: docs
---

# ChatUtils

Implements `IChatControl`

## Constructor

```ts
constructor();
```

## Properties

### ChatInstanceFactory

```ts
ChatInstanceFactory: any
```

### ChatInstanceCallbacks

```ts
ChatInstanceCallbacks: any
```

### _chats

```ts
_chats: any
```

### initializeCleanup

```ts
initializeCleanup: any
```

### getChatInstance

```ts
getChatInstance: any
```

Gets or creates a chat instance for a client

### beginChat

```ts
beginChat: (clientId: string, swarmName: string) => Promise<void>
```

Begins a chat session for a client

### sendMessage

```ts
sendMessage: (clientId: string, message: string, swarmName: string) => Promise<string>
```

Sends a message for a client

### listenDispose

```ts
listenDispose: (clientId: string, swarmName: string, fn: (clientId: string) => void) => void
```

Listens for dispose events for a client

### dispose

```ts
dispose: (clientId: string, swarmName: string) => Promise<void>
```

Disposes of a chat instance

## Methods

### useChatAdapter

```ts
useChatAdapter(Ctor: TChatInstanceCtor): void;
```

Sets the chat instance constructor

### useChatCallbacks

```ts
useChatCallbacks(Callbacks: Partial<IChatInstanceCallbacks>): void;
```

Sets chat instance callbacks
