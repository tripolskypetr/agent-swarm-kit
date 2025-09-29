---
title: docs/api-reference/function/overrideState
group: docs
---

# overrideState

```ts
declare function overrideState<T extends unknown = any>(stateSchema: TStateSchema<T>): IStateSchema<T>;
```

Overrides an existing state schema in the swarm system with a new or partial schema.
This function updates the configuration of a state identified by its `stateName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `stateSchema` | |
