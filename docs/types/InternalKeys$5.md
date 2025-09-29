---
title: docs/api-reference/type/InternalKeys$5
group: docs
---

# InternalKeys$5

```ts
type InternalKeys$5 = keyof {
    getStateRef: never;
    getSharedStateRef: never;
};
```

Type representing keys to exclude from ISharedStateConnectionService (internal methods).
Used to filter out non-public methods like getStateRef and getSharedStateRef in TSharedStateConnectionService.
