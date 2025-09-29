---
title: docs/api-reference/function/emit
group: docs
---

# emit

```ts
declare function emit(content: string, clientId: string, agentName: AgentName): Promise<void>;
```

Emits a string as model output without executing an incoming message, with agent activity validation.

This function directly emits a provided string as output from the swarm session, bypassing message execution, and is designed exclusively
for sessions established via `makeConnection`. It validates the session, swarm, and specified agent, ensuring the agent is still active
before emitting. If the active agent has changed, the operation is skipped. The execution is wrapped in `beginContext` for a clean environment,
logs the operation if enabled, and throws an error if the session mode is not "makeConnection".

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content to be processed or stored. |
| `clientId` | The unique identifier of the client session. |
| `agentName` | The name of the agent to use or reference. |
