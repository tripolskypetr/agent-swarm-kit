---
title: docs/api-reference/type/TSharedStateConnectionService
group: docs
---

# TSharedStateConnectionService

```ts
type TSharedStateConnectionService = {
    [key in Exclude<keyof ISharedStateConnectionService, InternalKeys$5>]: unknown;
};
```

Type representing the public interface of SharedStatePublicService, derived from ISharedStateConnectionService.
Excludes internal methods (e.g., getStateRef, getSharedStateRef) via InternalKeys, ensuring a consistent public API for shared state operations.
