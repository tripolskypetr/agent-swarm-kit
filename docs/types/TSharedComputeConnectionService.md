---
title: docs/api-reference/type/TSharedComputeConnectionService
group: docs
---

# TSharedComputeConnectionService

```ts
type TSharedComputeConnectionService = {
    [key in Exclude<keyof ISharedComputeConnectionService, InternalKeys>]: unknown;
};
```

Type for the shared compute public service, excluding internal keys.
