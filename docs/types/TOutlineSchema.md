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

Type definition for a partial outline schema, requiring an outline name and allowing optional properties from `IOutlineSchema`.
Used to specify the schema details for overriding an existing outline.
