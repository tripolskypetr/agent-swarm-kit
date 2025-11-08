---
title: docs/api-reference/function/overrideCompletion
group: docs
---

# overrideCompletion

```ts
declare function overrideCompletion(completionSchema: TCompletionSchema): ICompletionSchema<IBaseMessage<any>>;
```

Overrides an existing completion schema in the swarm system with a new or partial schema.
This function updates the configuration of a completion mechanism identified by its `completionName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `completionSchema` | The schema definition for completion. |
