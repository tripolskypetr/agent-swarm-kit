---
title: docs/api-reference/function/getAgentHistory
group: docs
---

# getAgentHistory

```ts
declare function getAgentHistory(clientId: string, agentName: AgentName): Promise<IModelMessage<object>[]>;
```

Retrieves the history prepared for a specific agent, incorporating rescue algorithm tweaks.

This function fetches the history tailored for a specified agent within a swarm session, applying any rescue strategies defined in the system (e.g., `CC_RESQUE_STRATEGY` from `GLOBAL_CONFIG`).
It validates the client session and agent, logs the operation if enabled, and retrieves the history using the agent's prompt configuration via the history public service.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session requesting the history. |
| `agentName` | The name of the agent whose history is being retrieved. |
