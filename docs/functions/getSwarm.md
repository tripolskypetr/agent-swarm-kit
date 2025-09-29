---
title: docs/api-reference/function/getSwarm
group: docs
---

# getSwarm

```ts
declare function getSwarm(swarmName: SwarmName): ISwarmSchema;
```

Retrieves a swarm schema by its name from the swarm's swarm schema service.
Logs the operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `swarmName` | The name of the swarm to operate on. |
