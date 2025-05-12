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
| `message` | The message/question to be processed |
| `clientId` | Unique identifier for the client |
| `wikiName` | Name of the wiki context |
