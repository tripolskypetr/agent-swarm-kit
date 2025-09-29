---
title: docs/api-reference/type/TStorageConnectionService
group: docs
---

# TStorageConnectionService

```ts
type TStorageConnectionService = {
    [key in Exclude<keyof IStorageConnectionService, InternalKeys$7>]: unknown;
};
```

Type representing the public interface of StoragePublicService, derived from IStorageConnectionService.
Excludes internal methods (e.g., getStorage, getSharedStorage) via InternalKeys, ensuring a consistent public API for client-specific storage operations.
