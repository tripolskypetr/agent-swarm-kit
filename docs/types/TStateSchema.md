---
title: docs/api-reference/type/TStateSchema
group: docs
---

# TStateSchema

```ts
type TStateSchema<T extends unknown = any> = {
    stateName: IStateSchema<T>["stateName"];
} & Partial<IStateSchema<T>>;
```

Type representing a partial state schema configuration.
Used for state management with optional properties.
