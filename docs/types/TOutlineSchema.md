---
title: docs/api-reference/type/TOutlineSchema
group: docs
---

# TOutlineSchema

```ts
type TOutlineSchema<Data extends IOutlineData = IOutlineData, Param extends IOutlineParam = IOutlineParam> = {
    outlineName: IOutlineSchema<Data, Param>["outlineName"];
} & Partial<IOutlineSchema<Data, Param>>;
```


