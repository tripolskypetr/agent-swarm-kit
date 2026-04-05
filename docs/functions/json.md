---
title: docs/api-reference/function/json
group: docs
---

# json

```ts
declare function json<Data extends IOutlineData = IOutlineData, Params extends IOutlineParam[] = IOutlineParam[]>(outlineName: OutlineName, ...params: Params): Promise<IOutlineResult<Data, Params>>;
```

Processes an outline request to generate structured JSON data based on a specified outline schema.
Delegates to an internal context-isolated function to ensure clean execution.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `outlineName` | The outlineName parameter. |
| `params` | The spread params passed to getOutlineHistory. |
