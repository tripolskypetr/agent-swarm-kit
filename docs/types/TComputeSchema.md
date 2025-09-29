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

Type representing a partial compute schema with required computeName.
Used for overriding existing compute configurations with selective updates.
