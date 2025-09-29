---
title: docs/api-reference/function/questionForce
group: docs
---

# questionForce

```ts
declare function questionForce(message: string, clientId: string, wikiName: WikiName): Promise<string>;
```

Initiates a forced question process within a chat context

## Parameters

| Parameter | Description |
|-----------|-------------|
| `message` | The message content to process or send. |
| `clientId` | The unique identifier of the client session. |
| `wikiName` | The name of the wiki. |
