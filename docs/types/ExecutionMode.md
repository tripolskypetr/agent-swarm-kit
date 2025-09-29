---
title: docs/api-reference/type/ExecutionMode
group: docs
---

# ExecutionMode

```ts
type ExecutionMode = "tool" | "user";
```

Type representing the source of execution within a session.
Tools emit "tool" messages (ignored in user history), while users emit "user" messages.
