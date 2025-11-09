---
title: docs/api-reference/function/chat
group: docs
---

# chat

```ts
declare function chat(completionName: CompletionName, messages: IBaseMessage[]): Promise<string>;
```

Processes a chat completion request by sending messages to a specified completion service.
Delegates to an internal context-isolated function to ensure clean execution.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `completionName` | The name of the completion service to use. |
| `messages` | Array of messages representing the conversation history. |
