---
title: docs/api-reference/type/TAdvisorSchema
group: docs
---

# TAdvisorSchema

```ts
type TAdvisorSchema = {
    advisorName: IAdvisorSchema["advisorName"];
} & Partial<IAdvisorSchema>;
```

Type representing a partial advisor schema configuration.
Used for advisor service configuration with optional properties.
