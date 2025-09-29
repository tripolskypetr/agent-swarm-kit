---
title: docs/api-reference/type/TPolicySchema
group: docs
---

# TPolicySchema

```ts
type TPolicySchema = {
    policyName: IPolicySchema["policyName"];
} & Partial<IPolicySchema>;
```

Type representing a partial policy schema with required policyName.
Used for overriding existing policy configurations with selective updates.
Combines required policy name with optional policy properties.
