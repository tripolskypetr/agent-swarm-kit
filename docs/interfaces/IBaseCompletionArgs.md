---
title: docs/api-reference/interface/IBaseCompletionArgs
group: docs
---

# IBaseCompletionArgs

Base interface representing the common arguments required for all completion requests.
Contains only the essential fields shared by all completion types.
Extended by IOutlineCompletionArgs and ISwarmCompletionArgs to add specific fields.

## Properties

### clientId

```ts
clientId: string
```

client identifier for tracking and error handling.

### messages

```ts
messages: Message[]
```

An array of messages providing the conversation history or context for the completion.
