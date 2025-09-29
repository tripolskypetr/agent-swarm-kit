---
title: docs/api-reference/type/TCompletionSchema
group: docs
---

# TCompletionSchema

```ts
type TCompletionSchema = {
    completionName: ICompletionSchema["completionName"];
} & Partial<ICompletionSchema>;
```

Type representing a partial completion schema with required completionName.
Used for overriding existing completion configurations with selective updates.
Combines required completion name with optional completion properties.
