---
title: docs/api-reference/function/addAgent
group: docs
---

# addAgent

```ts
declare function addAgent(agentSchema: IAgentSchema): string;
```

Adds a new agent to the agent registry for use within the swarm system.

This function registers a new agent by adding it to the agent validation and schema services, making it available for swarm operations.
Only agents registered through this function can be utilized by the swarm. The execution is wrapped in `beginContext` to ensure it runs
outside of existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled
and returns the agent's name upon successful registration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `agentSchema` | |
