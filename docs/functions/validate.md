---
title: docs/api-reference/function/validate
group: docs
---

# validate

```ts
declare function validate(args?: Partial<Args>): void;
```

Validates the existence of all provided entity names across validation services.

This function accepts enum objects for various entity types (swarms, agents, outlines,
advisors, completions, computes, embeddings, MCPs, pipelines, policies, states,
storages, tools) and validates that each entity name exists in its respective
registry. Validation results are memoized for performance.

If no arguments are provided (or specific entity types are omitted), the function
automatically fetches and validates ALL registered entities from their respective
validation services. This is useful for comprehensive validation of the entire setup.

Use this before running operations to ensure all referenced entities are properly
registered and configured.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `args` | Partial validation arguments containing entity name enums to validate.
   If empty or omitted, validates all registered entities. |
