---
title: docs/api-reference/type/TComputeSchema
group: docs
---

# TComputeSchema

```ts
type TComputeSchema<T extends IComputeData = any> = {
    computeName: IComputeSchema<T>["computeName"];
} & Partial<IComputeSchema<T>>;
```


