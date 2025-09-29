---
title: docs/api-reference/type/TStateConnectionService
group: docs
---

# TStateConnectionService

```ts
type TStateConnectionService = {
    [key in Exclude<keyof IStateConnectionService, InternalKeys$6>]: unknown;
};
```

Type representing the public interface of StatePublicService, derived from IStateConnectionService.
Excludes internal methods (e.g., getStateRef, getSharedStateRef) via InternalKeys, ensuring a consistent public API for client-specific state operations.
