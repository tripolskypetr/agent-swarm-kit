---
title: docs/api-reference/function/json
group: docs
---

# json

```ts
declare function json<Data extends IOutlineData = IOutlineData, Param extends IOutlineParam = IOutlineParam>(outlineName: OutlineName, param?: Param): Promise<IOutlineResult<Data, Param>>;
```

Processes an outline request to generate structured JSON data based on a specified outline schema.
Delegates to an internal context-isolated function to ensure clean execution.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `outlineName` | The outlineName parameter. |
| `param` | The param parameter. |
