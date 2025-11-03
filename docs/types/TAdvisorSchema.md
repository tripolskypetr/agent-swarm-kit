---
title: docs/api-reference/type/TAdvisorSchema
group: docs
---

# TAdvisorSchema

```ts
type TAdvisorSchema<T = string> = {
    advisorName: IAdvisorSchema<T>["advisorName"];
} & Partial<IAdvisorSchema<T>>;
```

Type representing a partial advisor schema configuration.
Used for advisor service configuration with optional properties.
