---
title: docs/api-reference/type/TStorage
group: docs
---

# TStorage

```ts
type TStorage = {
    [key in keyof IStorage]: unknown;
};
```

Type definition for a storage object, mapping IStorage keys to unknown values.
Used for type-safe storage access within client context.
