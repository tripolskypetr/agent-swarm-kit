---
title: docs/api-reference/function/executeForce
group: docs
---

# executeForce

```ts
declare function executeForce(content: string, clientId: string): Promise<string>;
```

Sends a message to the active agent in a swarm session as if it originated from the client side, forcing execution regardless of agent activity.

This function executes a command or message on behalf of the active agent within a swarm session, designed for scenarios like reviewing tool output
or initiating a model-to-client conversation. Unlike `execute`, it does not check if the agent is currently active, ensuring execution even if the
agent has changed or is inactive. It validates the session and swarm, executes the content with performance tracking and event bus notifications,
and is wrapped in `beginContext` for a clean environment and `ExecutionContextService` for metadata tracking.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | |
| `clientId` | |
