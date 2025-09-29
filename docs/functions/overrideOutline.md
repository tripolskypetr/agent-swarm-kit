---
title: docs/api-reference/function/overrideOutline
group: docs
---

# overrideOutline

```ts
declare function overrideOutline<Data extends IOutlineData = IOutlineData, Param extends IOutlineParam = IOutlineParam>(outlineSchema: TOutlineSchema<Data, Param>): IOutlineSchema<any, any>;
```

Overrides an existing outline schema in the swarm system by updating it with the provided partial schema.
Ensures the operation runs in a clean context using `beginContext` to avoid interference from existing method or execution contexts.
Logs the operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `outlineSchema` | |
