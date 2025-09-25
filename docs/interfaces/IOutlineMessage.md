---
title: docs/api-reference/interface/IOutlineMessage
group: docs
---

# IOutlineMessage

Interface representing a message in the outline system.
Used to structure messages stored in the outline history, typically for user, assistant, or system interactions.

## Properties

### role

```ts
role: "tool" | "user" | "assistant" | "system"
```

The role of the message sender, either user, assistant, or system.
Determines the context or source of the message in the outline history.

### images

```ts
images: string[] | Uint8Array[]
```

### content

```ts
content: string
```

The content of the message.
Contains the raw text or param of the message, used in history storage or processing.

### tool_calls

```ts
tool_calls: IToolCall[]
```

The name of the agent associated with the message.
Allow to attach tool call request to specific message

### tool_call_id

```ts
tool_call_id: string
```

Optional ID of the tool call associated with the message.
Used to link the message to a specific tool execution request.
