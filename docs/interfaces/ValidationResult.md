---
title: docs/api-reference/interface/ValidationResult
group: docs
---

# ValidationResult

Result of tool arguments validation

## Properties

### success

```ts
success: boolean
```

Whether validation was successful

### data

```ts
data: T
```

Parsed and validated data (only present when success is true)

### error

```ts
error: string
```

Error message (only present when success is false)
