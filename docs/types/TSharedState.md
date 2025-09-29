---
title: docs/api-reference/type/TSharedState
group: docs
---

# TSharedState

```ts
type TSharedState = {
    [key in keyof IState]: unknown;
};
```

Type definition for a shared state object, mapping IState keys to unknown values.
Used for type-safe shared state access across multiple clients.
