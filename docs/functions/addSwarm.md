---
title: docs/api-reference/function/addSwarm
group: docs
---

# addSwarm

```ts
declare function addSwarm(swarmSchema: ISwarmSchema): string;
```

Adds a new swarm to the system for managing client sessions.

This function registers a new swarm, which serves as the root entity for initiating and managing client sessions within the system.
The swarm defines the structure and behavior of agent interactions and session workflows. Only swarms registered through this function
are recognized by the system. The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts,
providing a clean execution environment. The function logs the operation if enabled and returns the swarm's name upon successful registration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `swarmSchema` | The schema defining the swarm's properties, including its name (`swarmName`), default agent, and other configuration details. |
