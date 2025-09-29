---
title: docs/api-reference/type/InternalKeys$4
group: docs
---

# InternalKeys$4

```ts
type InternalKeys$4 = keyof {
    getStorage: never;
    getSharedStorage: never;
};
```

Type representing keys to exclude from ISharedStorageConnectionService (internal methods).
Used to filter out non-public methods like getStorage and getSharedStorage in TSharedStorageConnectionService.
