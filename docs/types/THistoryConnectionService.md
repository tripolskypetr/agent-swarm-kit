---
title: docs/api-reference/type/THistoryConnectionService
group: docs
---

# THistoryConnectionService

```ts
type THistoryConnectionService = {
    [key in Exclude<keyof IHistoryConnectionService, InternalKeys$a>]: unknown;
};
```

Type representing the public interface of HistoryPublicService, derived from IHistoryConnectionService.
Excludes internal methods (e.g., getHistory, getItems) via InternalKeys, ensuring a consistent public API for history operations.
