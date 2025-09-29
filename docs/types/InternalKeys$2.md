---
title: docs/api-reference/type/InternalKeys$2
group: docs
---

# InternalKeys$2

```ts
type InternalKeys$2 = keyof {
    getMCP: never;
};
```

Internal keys that should be excluded from the public MCP service interface.
Used to hide internal getMCP method from public API exposure.
