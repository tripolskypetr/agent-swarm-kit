---
title: docs/api-reference/type/TEmbeddingSchema
group: docs
---

# TEmbeddingSchema

```ts
type TEmbeddingSchema = {
    embeddingName: IEmbeddingSchema["embeddingName"];
} & Partial<IEmbeddingSchema>;
```

Type representing a partial embedding schema with required embeddingName.
Used for overriding existing embedding configurations with selective updates.
Combines required embedding name with optional embedding properties.
