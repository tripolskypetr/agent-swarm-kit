---
title: docs/api-reference/function/ask
group: docs
---

# ask

```ts
declare function ask(message: string, advisorName: AdvisorName, images?: Image[]): Promise<string>;
```

Initiates an ask process within a chat context

## Parameters

| Parameter | Description |
|-----------|-------------|
| `message` | The message content to process or send. |
| `advisorName` | The name of the advisor. |
| `images` | Optional array of images (as Uint8Array or string). |
