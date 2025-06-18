---
title: docs/api-reference/function/getCompute
group: docs
---

# getCompute

```ts
declare function getCompute(computeName: ComputeName): IComputeSchema<any>;
```

Retrieves a compute schema by its name from the swarm's compute schema service.
Logs the operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `computeName` | The name of the compute to retrieve. |
