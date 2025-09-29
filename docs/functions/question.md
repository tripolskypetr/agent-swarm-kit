---
title: docs/api-reference/function/question
group: docs
---

# question

```ts
declare function question(message: string, clientId: string, agentName: AgentName, wikiName: WikiName): Promise<string>;
```

Initiates a question process within a chat context

## Parameters

| Parameter | Description |
|-----------|-------------|
| `message` | The message content to process or send. |
| `clientId` | The unique identifier of the client session. |
| `agentName` | The name of the agent to use or reference. |
| `wikiName` | The name of the wiki. |
