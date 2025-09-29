---
title: docs/api-reference/type/InternalKeys$6
group: docs
---

# InternalKeys$6

```ts
type InternalKeys$6 = keyof {
    getStateRef: never;
    getSharedStateRef: never;
};
```

Type representing keys to exclude from IStateConnectionService (internal methods).
Used to filter out non-public methods like getStateRef and getSharedStateRef in TStateConnectionService.
