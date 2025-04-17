---
title: docs/api-reference/type/TStorageSchema
group: docs
---

# TStorageSchema

```ts
type TStorageSchema<T extends IStorageData = IStorageData> = {
    storageName: IStorageSchema<T>["storageName"];
} & Partial<IStorageSchema<T>>;
```


