---
title: docs/api-reference/type/TSharedStorageConnectionService
group: docs
---

# TSharedStorageConnectionService

```ts
type TSharedStorageConnectionService = {
    [key in Exclude<keyof ISharedStorageConnectionService, InternalKeys$4>]: unknown;
};
```

Type representing the public interface of SharedStoragePublicService, derived from ISharedStorageConnectionService.
Excludes internal methods (e.g., getStorage, getSharedStorage) via InternalKeys, ensuring a consistent public API for shared storage operations.
