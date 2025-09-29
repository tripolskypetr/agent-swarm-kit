---
title: docs/api-reference/function/overridePolicy
group: docs
---

# overridePolicy

```ts
declare function overridePolicy(policySchema: TPolicySchema): IPolicySchema;
```

Overrides an existing policy schema in the swarm system with a new or partial schema.
This function updates the configuration of a policy identified by its `policyName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `policySchema` | The schema definition for policy. |
