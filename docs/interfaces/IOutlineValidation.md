---
title: docs/api-reference/interface/IOutlineValidation
group: docs
---

# IOutlineValidation

Interface representing a validation configuration for outline operations.
Defines the validation logic and optional documentation for a specific validator.

## Properties

### validate

```ts
validate: IOutlineValidationFn<Data, Param>
```

The validation function or configuration to apply to the outline data.
Can reference itself or another validation for chained or reusable logic.

### docDescription

```ts
docDescription: string
```

Optional description for documentation purposes.
Aids in understanding the purpose or behavior of the validation.
