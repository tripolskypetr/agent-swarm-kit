---
title: docs/api-reference/function/overrideCompute
group: docs
---

# overrideCompute

```ts
declare function overrideCompute<T extends IComputeData = any>(computeSchema: TComputeSchema<T>): IComputeSchema<any>;
```

Overrides an existing compute schema with provided partial updates.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `computeSchema` | The partial compute schema with updates. |
