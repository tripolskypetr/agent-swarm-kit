---
title: docs/api-reference/function/ask
group: docs
---

# ask

```ts
declare function ask<T = string>(message: T, advisorName: AdvisorName): Promise<string>;
```

Initiates an ask process within a chat context.
Sends a message to the specified advisor and returns the chat response.
Supports custom message types including objects, Blob, or string.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `message` | The message content to process or send. Type should match the advisor's expected message type. |
| `advisorName` | The name of the advisor to handle the message. |
