---
title: docs/api-reference/type/Payload
group: docs
---

# Payload

```ts
type Payload<T extends IStorageData = IStorageData> = {
    itemId: IStorageData["id"];
    item: T;
};
```

Type representing the payload for storage actions in ClientStorage.
Defines the structure for upsert and remove operations, with optional fields based on action type.
 *  *  *
