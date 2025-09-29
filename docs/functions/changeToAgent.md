---
title: docs/api-reference/function/changeToAgent
group: docs
---

# changeToAgent

```ts
declare function changeToAgent(agentName: AgentName, clientId: string): Promise<boolean>;
```

Changes the active agent for a given client session in a swarm.

This function facilitates switching the active agent in a swarm session, validating the session and agent dependencies,
logging the operation if enabled, and executing the change using a TTL-limited, queued runner.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `agentName` | |
| `clientId` | |
