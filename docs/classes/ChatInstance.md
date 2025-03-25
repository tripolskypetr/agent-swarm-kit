# ChatInstance

Implements `IChatInstance`

## Constructor

```ts
constructor(clientId: string, swarmName: string, onDispose: DisposeFn, callbacks: Partial<IChatInstanceCallbacks>);
```

## Properties

### clientId

```ts
clientId: any
```

### swarmName

```ts
swarmName: any
```

### onDispose

```ts
onDispose: any
```

### callbacks

```ts
callbacks: any
```

### _disposeSubject

```ts
_disposeSubject: any
```

### _chatSession

```ts
_chatSession: any
```

### _lastActivity

```ts
_lastActivity: any
```

## Methods

### checkLastActivity

```ts
checkLastActivity(now: number): Promise<boolean>;
```

Checks if the chat has been active within the timeout period

### beginChat

```ts
beginChat(): Promise<void>;
```

Begins a chat session

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
