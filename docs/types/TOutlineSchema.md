---
title: docs/api-reference/type/TOutlineSchema
group: docs
---

# TOutlineSchema

```ts
type TOutlineSchema<Data extends IOutlineData = IOutlineData, Params extends IOutlineParam[] = IOutlineParam[]> = {
    outlineName: IOutlineSchema<Data, Params>["outlineName"];
} & Partial<IOutlineSchema<Data, Params>>;
```

Type definition for a partial outline schema, requiring an outline name and allowing optional properties from `IOutlineSchema`.
Used to specify the schema details for overriding an existing outline.
