---
title: docs/api-reference/function/overrideSwarm
group: docs
---

# overrideSwarm

```ts
declare function overrideSwarm(swarmSchema: TSwarmSchema): ISwarmSchema;
```

Overrides an existing swarm schema in the swarm system with a new or partial schema.
This function updates the configuration of a swarm identified by its `swarmName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `swarmSchema` | The schema definition for swarm. |
