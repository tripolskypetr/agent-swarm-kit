---
title: docs/api-reference/type/Action
group: docs
---

# Action

```ts
type Action = "read" | "write";
```

Type representing possible actions for ClientState operations.
Used in dispatch to determine whether to read or write the state.
