---
title: docs/api-reference/type/TComputeConnectionService
group: docs
---

# TComputeConnectionService

```ts
type TComputeConnectionService = {
    [key in Exclude<keyof IComputeConnectionService, InternalKeys$1>]: unknown;
};
```

* Type for the public compute service, excluding internal keys.
