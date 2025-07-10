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
role: "user" | "assistant" | "system"
```

The role of the message sender, either user, assistant, or system.
Determines the context or source of the message in the outline history.

### content

```ts
content: string
```

The content of the message.
Contains the raw text or param of the message, used in history storage or processing.
