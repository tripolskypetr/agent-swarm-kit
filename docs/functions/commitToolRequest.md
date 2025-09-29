---
title: docs/api-reference/function/commitToolRequest
group: docs
---

# commitToolRequest

```ts
declare function commitToolRequest(request: IToolRequest[], clientId: string, agentName: string): Promise<string[]>;
```

Commits a tool request to the active agent in the swarm system.
Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the request.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.


Function overloads

## Parameters

| Parameter | Description |
|-----------|-------------|
| `request` | |
| `clientId` | |
| `agentName` | |
