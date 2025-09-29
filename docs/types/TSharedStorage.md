---
title: docs/api-reference/type/TSharedStorage
group: docs
---

# TSharedStorage

```ts
type TSharedStorage = {
    [key in keyof IStorage]: unknown;
};
```

Type definition for a shared storage object, mapping IStorage keys to unknown values.
