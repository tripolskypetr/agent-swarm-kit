---
title: docs/api-reference/type/InternalKeys$b
group: docs
---

# InternalKeys$b

```ts
type InternalKeys$b = keyof {
    getAgent: never;
};
```

Type representing keys to exclude from IAgentConnectionService (internal methods).
Used to filter out non-public methods like getAgent in TAgentConnectionService.
