---
title: docs/api-reference/type/TPolicyConnectionService
group: docs
---

# TPolicyConnectionService

```ts
type TPolicyConnectionService = {
    [key in Exclude<keyof IPolicyConnectionService, InternalKeys$3>]: unknown;
};
```

Type representing the public interface of PolicyPublicService, derived from IPolicyConnectionService.
Excludes internal methods (e.g., getPolicy) via InternalKeys, ensuring a consistent public API for policy operations.
