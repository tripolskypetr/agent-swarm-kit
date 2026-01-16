---
title: docs/api-reference/function/overrideAgent
group: docs
---

# overrideAgent

```ts
declare function overrideAgent(agentSchema: TAgentSchema): Promise<IAgentSchemaInternal>;
```

Overrides an existing agent schema in the swarm system with a new or partial schema.
This function updates the configuration of an agent identified by its `agentName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `agentSchema` | The schema definition for agent. |
