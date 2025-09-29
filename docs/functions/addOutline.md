---
title: docs/api-reference/function/addOutline
group: docs
---

# addOutline

```ts
declare function addOutline<Data extends IOutlineData = IOutlineData, Param extends IOutlineParam = IOutlineParam>(outlineSchema: IOutlineSchema<Data, Param>): string;
```

Adds an outline schema to the swarm system by registering it with the outline validation and schema services.
Ensures the operation runs in a clean context using `beginContext` to avoid interference from existing method or execution contexts.
Logs the operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `outlineSchema` | |
