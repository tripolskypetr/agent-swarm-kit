---
title: docs/api-reference/type/TState
group: docs
---

# TState

```ts
type TState = {
    [key in keyof IState]: unknown;
};
```

Type definition for a state object, mapping IState keys to unknown values.
Used for type-safe state access within client context.
