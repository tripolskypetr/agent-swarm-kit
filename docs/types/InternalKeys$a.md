---
title: docs/api-reference/type/InternalKeys$a
group: docs
---

# InternalKeys$a

```ts
type InternalKeys$a = keyof {
    getHistory: never;
    getItems: never;
};
```

Type representing keys to exclude from IHistoryConnectionService (internal methods).
Used to filter out non-public methods like getHistory and getItems in THistoryConnectionService.
