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
| `message` | The message/question to be processed |
| `clientId` | Unique identifier for the client |
| `agentName` | Name of the agent handling the question |
| `wikiName` | Name of the wiki context |
