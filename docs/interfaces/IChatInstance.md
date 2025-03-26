---
title: docs/api-reference/interface/IChatInstance
group: docs
---

# IChatInstance

## Methods

### beginChat

```ts
beginChat: () => Promise<void>
```

Begins a chat session

### checkLastActivity

```ts
checkLastActivity: (now: number) => Promise<boolean>
```

Checks if the chat has been active within the timeout period

### sendMessage

```ts
sendMessage: (content: string) => Promise<string>
```

Sends a message in the chat

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the chat instance

### listenDispose

```ts
listenDispose: (fn: (clientId: string) => void) => void
```

Adds a listener for dispose events
