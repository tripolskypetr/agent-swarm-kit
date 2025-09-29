---
title: docs/api-reference/function/addCompute
group: docs
---

# addCompute

```ts
declare function addCompute<T extends IComputeData = any>(computeSchema: IComputeSchema<T>): string;
```

Registers a compute schema, validates it, and adds it to the compute schema service.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `computeSchema` | Partial compute schema with updates to be applied to the existing compute configuration. |
