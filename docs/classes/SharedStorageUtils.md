---
title: docs/api-reference/class/SharedStorageUtils
group: docs
---

# SharedStorageUtils

Implements `TSharedStorage`

Utility class for managing shared storage within an agent swarm.
Provides methods to manipulate and query storage data, interfacing with the swarm's shared storage service.

## Constructor

```ts
constructor();
```

## Properties

### take

```ts
take: <T extends IStorageData = IStorageData>(payload: { search: string; total: number; storageName: string; score?: number; }) => Promise<T[]>
```

Retrieves a specified number of items from storage matching a search query.
Executes within a context for logging and validation, ensuring the storage name is valid.

### upsert

```ts
upsert: <T extends IStorageData = IStorageData>(item: T, storageName: string) => Promise<void>
```

Inserts or updates an item in the storage.
Executes within a context for logging and validation, ensuring the storage name is valid.

### remove

```ts
remove: (itemId: StorageId, storageName: string) => Promise<void>
```

Removes an item from the storage by its ID.
Executes within a context for logging and validation, ensuring the storage name is valid.

### get

```ts
get: <T extends IStorageData = IStorageData>(itemId: StorageId, storageName: string) => Promise<T>
```

Retrieves an item from the storage by its ID.
Executes within a context for logging and validation, ensuring the storage name is valid.

### list

```ts
list: <T extends IStorageData = IStorageData>(storageName: string, filter?: (item: T) => boolean) => Promise<T[]>
```

Lists all items in the storage, optionally filtered by a predicate.
Executes within a context for logging and validation, ensuring the storage name is valid.

### clear

```ts
clear: (storageName: string) => Promise<void>
```

Clears all items from the storage.
Executes within a context for logging and validation, ensuring the storage name is valid.
