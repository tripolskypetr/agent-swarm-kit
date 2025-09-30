---
title: docs/api-reference/class/ClientStorage
group: docs
---

# ClientStorage

Implements `IStorage<T>`

Class managing storage operations with embedding-based search capabilities in the swarm system.
Implements IStorage, supporting upsert, remove, clear, and similarity-based search with queued operations and event-driven updates.
Integrates with StorageConnectionService (instantiation), EmbeddingSchemaService (embeddings), ClientAgent (data storage),
SwarmConnectionService (swarm-level storage), and BusService (event emission).

## Constructor

```ts
constructor(params: IStorageParams<T>);
```

## Properties

### params

```ts
params: IStorageParams<T>
```

### _itemMap

```ts
_itemMap: Map<string | number, T>
```

Internal map to store items by their IDs, used for fast retrieval and updates.
Populated during initialization (waitForInit) and modified by upsert, remove, and clear operations.

### dispatch

```ts
dispatch: (action: Action$1, payload: Partial<Payload<T>>) => Promise<void>
```

Dispatches a storage action (upsert, remove, or clear) in a queued manner, delegating to DISPATCH_FN.
Ensures sequential execution of storage operations, supporting thread-safe updates from ClientAgent or tools.

### _createEmbedding

```ts
_createEmbedding: ((item: T) => Promise<readonly [Embeddings, string][]>) & IClearableMemoize<string | number> & IControlMemoize<string | number, Promise<readonly [Embeddings, string][]>>
```

Creates embeddings for the given item, memoized by item ID to avoid redundant calculations via CREATE_EMBEDDING_FN.
Caches results for efficiency, cleared on upsert/remove to ensure freshness, supporting EmbeddingSchemaService.

### waitForInit

```ts
waitForInit: (() => Promise<void>) & ISingleshotClearable
```

Waits for the initialization of the storage, loading initial data and creating embeddings via WAIT_FOR_INIT_FN.
Ensures initialization happens only once using singleshot, supporting StorageConnectionService’s lifecycle.

## Methods

### take

```ts
take(search: string, total: number, score?: number): Promise<T[]>;
```

Retrieves a specified number of items based on similarity to a search string, using embeddings and SortedArray.
Executes similarity calculations concurrently via execpool, respecting GLOBAL_CONFIG.CC_STORAGE_SEARCH_POOL, and filters by score.
Emits an event via BusService, supporting ClientAgent’s search-driven tool execution.

### upsert

```ts
upsert(item: T): Promise<void>;
```

Upserts an item into the storage via the dispatch queue, delegating to UPSERT_FN.
Schedules the operation for sequential execution, supporting ClientAgent’s data persistence needs.

### remove

```ts
remove(itemId: IStorageData["id"]): Promise<void>;
```

Removes an item from the storage by its ID via the dispatch queue, delegating to REMOVE_FN.
Schedules the operation for sequential execution, supporting ClientAgent’s data management.

### clear

```ts
clear(): Promise<void>;
```

Clears all items from the storage via the dispatch queue, delegating to CLEAR_FN.
Schedules the operation for sequential execution, supporting storage reset operations.

### get

```ts
get(itemId: IStorageData["id"]): Promise<T | null>;
```

Retrieves an item from the storage by its ID directly from _itemMap.
Emits an event via BusService with the result, supporting quick lookups by ClientAgent or tools.

### list

```ts
list(filter?: (item: T) => boolean): Promise<T[]>;
```

Lists all items in the storage from _itemMap, optionally filtered by a predicate.
Emits an event via BusService with the filtered result if a filter is provided, supporting ClientAgent’s data enumeration.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the storage instance, invoking the onDispose callback if provided and logging via BusService.
Ensures proper cleanup with StorageConnectionService when the storage is no longer needed.
