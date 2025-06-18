---
title: docs/api-reference/function/getAgent
group: docs
---

# getAgent

```ts
declare function getAgent(agentName: AgentName): IAgentSchemaInternal;
```

Retrieves an agent schema by its name from the swarm's agent schema service.
Logs the operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `agentName` | The name of the agent to retrieve. |
