---
title: docs/api-reference/function/execute
group: docs
---

# execute

```ts
declare function execute(content: string, clientId: string, agentName: AgentName): Promise<string>;
```

Sends a message to the active agent in a swarm session as if it originated from the client side.

This function executes a command or message on behalf of the specified agent within a swarm session, designed for scenarios like reviewing tool output
or initiating a model-to-client conversation. It validates the agent and session, checks if the specified agent is still active, and executes the content
with performance tracking and event bus notifications. The execution is wrapped in `beginContext` for a clean environment and runs within an
`ExecutionContextService` context for metadata tracking. If the active agent has changed, the operation is skipped.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | |
| `clientId` | |
| `agentName` | |
