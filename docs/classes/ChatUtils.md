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

### sendMessage

```ts
sendMessage: (clientId: SessionId$1, message: string, swarmName: string) => Promise<string>
```

Sends a message for a specific client

### listenDispose

```ts
listenDispose: (clientId: SessionId$1, swarmName: string, fn: (clientId: SessionId$1) => void) => () => void
```

Subscribes to disposal events for a specific client
