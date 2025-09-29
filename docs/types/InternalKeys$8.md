---
title: docs/api-reference/type/InternalKeys$8
group: docs
---

# InternalKeys$8

```ts
type InternalKeys$8 = keyof {
    getSwarm: never;
};
```

Type representing keys to exclude from ISwarmConnectionService (internal methods).
Used to filter out non-public methods like getSwarm in TSwarmConnectionService.
