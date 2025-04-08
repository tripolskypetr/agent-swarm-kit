---
title: docs/api-reference/class/OperatorInstance
group: docs
---

# OperatorInstance

Implements `IOperatorInstance`

Operator instance implementation

## Constructor

```ts
constructor(clientId: string, agentName: string, callbacks: Partial<IOperatorInstanceCallbacks>);
```

## Properties

### clientId

```ts
clientId: string
```

### agentName

```ts
agentName: string
```

### callbacks

```ts
callbacks: Partial<IOperatorInstanceCallbacks>
```

### _answerSubject

```ts
_answerSubject: any
```

## Methods

### connectAnswer

```ts
connectAnswer(next: (answer: string) => void): void;
```

Connects an answer subscription

### notify

```ts
notify(content: string): Promise<void>;
```

Sends a notification

### answer

```ts
answer(content: string): Promise<void>;
```

Sends an answer

### recieveMessage

```ts
recieveMessage(message: string): Promise<void>;
```

Receives a message

### dispose

```ts
dispose(): Promise<void>;
```

Disposes the operator instance
