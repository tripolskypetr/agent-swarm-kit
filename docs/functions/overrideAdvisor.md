---
title: docs/api-reference/function/overrideAdvisor
group: docs
---

# overrideAdvisor

```ts
declare function overrideAdvisor<T = string>(advisorSchema: TAdvisorSchema<T>): IAdvisorSchema<string>;
```

Overrides an existing advisor schema in the swarm system with a new or partial schema.
This function updates the configuration of an advisor identified by its `advisorName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `advisorSchema` | The schema definition for advisor. |
