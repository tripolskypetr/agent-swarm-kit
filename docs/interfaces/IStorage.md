---
title: docs/api-reference/interface/IStorage
group: docs
---

# IStorage

Interface representing the runtime storage management API.
Provides methods to manipulate and query storage data.

## Methods

### take

```ts
take: (search: string, total: number, score?: number) => Promise<T[]>
```

Retrieves a specified number of items from the storage based on a search query.
Uses embeddings for similarity-based retrieval.

### upsert

```ts
upsert: (item: T) => Promise<void>
```

Inserts or updates an item in the storage.
Updates the index and persists data if configured.

### remove

```ts
remove: (itemId: StorageId) => Promise<void>
```

Removes an item from the storage by its ID.
Updates the index and persists changes if configured.

### get

```ts
get: (itemId: StorageId) => Promise<T>
```

Retrieves an item from the storage by its ID.

### list

```ts
list: (filter?: (item: T) => boolean) => Promise<T[]>
```

Lists all items in the storage, optionally filtered by a predicate.

### clear

```ts
clear: () => Promise<void>
```

Clears all items from the storage, resetting it to an empty state.
Persists changes if configured.
