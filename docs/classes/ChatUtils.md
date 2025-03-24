# ChatUtils

Utility class for managing multiple chat instances

## Constructor

```ts
constructor();
```

## Properties

### _chats

```ts
_chats: any
```

### initializeCleanup

```ts
initializeCleanup: any
```

Initializes cleanup interval for inactive chats

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

Sends a message for a specific client

### listenDispose

```ts
listenDispose: (clientId: string, swarmName: string, fn: (clientId: string) => void) => () => void
```

Subscribes to disposal events for a specific client's chat

### dispose

```ts
dispose: (clientId: string, swarmName: string) => Promise<void>
```

Disposes of a specific chat instance for a client
