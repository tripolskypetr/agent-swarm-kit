---
title: docs/api-reference/type/InternalKeys$7
group: docs
---

# InternalKeys$7

```ts
type InternalKeys$7 = keyof {
    getStorage: never;
    getSharedStorage: never;
};
```

Type representing keys to exclude from IStorageConnectionService (internal methods).
Used to filter out non-public methods like getStorage and getSharedStorage in TStorageConnectionService.
