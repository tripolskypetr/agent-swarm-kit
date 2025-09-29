---
title: docs/api-reference/type/TSessionConnectionService
group: docs
---

# TSessionConnectionService

```ts
type TSessionConnectionService = {
    [key in Exclude<keyof ISessionConnectionService, InternalKeys$9>]: unknown;
};
```

Type representing the public interface of SessionPublicService, derived from ISessionConnectionService.
Excludes internal methods (e.g., getSession) via InternalKeys, ensuring a consistent public API for session operations.
