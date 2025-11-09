---
title: docs/api-reference/interface/IBaseMessage
group: docs
---

# IBaseMessage

Base interface representing common properties shared by all message types in the swarm system.
Defines the core structure for messages exchanged between agents, tools, users, and the system.
Extended by ISwarmMessage and IOutlineMessage to add specific properties for their respective contexts.

## Properties

### role

```ts
role: Role
```

The role of the message sender.
Common roles include "assistant", "system", "tool", and "user".
Specific message types may extend this with additional roles.

### content

```ts
content: string
```

The content of the message, representing the primary data or text being communicated.
Contains the raw text or data of the message, used in history storage or processing.

### tool_calls

```ts
tool_calls: IToolCall[]
```

Optional array of tool calls associated with the message.
Present when the model requests tool execution.
Each tool call contains function name, arguments, and a unique identifier.

### images

```ts
images: string[] | Blob[]
```

Optional array of images associated with the message.
Represented as binary data (Blob) or base64 strings.
Used for messages involving visual content (e.g., user-uploaded images or tool-generated visuals).

### tool_call_id

```ts
tool_call_id: string
```

Optional identifier of the tool call this message responds to.
Links tool outputs to their originating requests.
Used to correlate tool responses with their corresponding tool calls.
