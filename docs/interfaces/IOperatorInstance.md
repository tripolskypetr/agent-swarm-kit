---
title: docs/api-reference/interface/IOperatorInstance
group: docs
---

# IOperatorInstance

Interface for Operator instance functionality

## Methods

### connectAnswer

```ts
connectAnswer: (next: (answer: string) => void) => void
```

Connects an answer handler

### answer

```ts
answer: (content: string) => Promise<void>
```

Sends an answer

### init

```ts
init: () => Promise<void>
```

Init the connection

### notify

```ts
notify: (content: string) => Promise<void>
```

Sends a notification

### recieveMessage

```ts
recieveMessage: (message: string) => Promise<void>
```

Receives a message

### dispose

```ts
dispose: () => Promise<void>
```

Disposes the operator instance
