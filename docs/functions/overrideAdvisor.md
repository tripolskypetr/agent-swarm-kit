---
title: docs/api-reference/function/overrideAdvisor
group: docs
---

# overrideAdvisor

```ts
declare function overrideAdvisor<T = string>(advisorSchema: TAdvisorSchema<T>): Promise<TAdvisorSchema<T>>;
```

Overrides an existing advisor schema in the swarm system with a new or partial schema.
This function updates the configuration of an advisor identified by its `advisorName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.
Only the provided properties will be updated - omitted properties remain unchanged.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `advisorSchema` | Partial schema definition for advisor. Must include `advisorName`, other properties are optional. |
