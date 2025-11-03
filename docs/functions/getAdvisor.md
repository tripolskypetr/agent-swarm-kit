---
title: docs/api-reference/function/getAdvisor
group: docs
---

# getAdvisor

```ts
declare function getAdvisor(advisorName: AdvisorName): IAdvisorSchema<string>;
```

Retrieves an advisor schema by its name from the swarm's advisor schema service.
Logs the operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `advisorName` | The name of the advisor. |
