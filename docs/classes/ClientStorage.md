# ClientStorage

Implements `IStorage<T>`

Class managing storage operations with embedding-based search capabilities.
Supports upserting, removing, and searching items with similarity scoring.

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

Internal map to store items by their IDs.

### dispatch

```ts
dispatch: (action: Action, payload: Partial<Payload<T>>) => Promise<void>
```

Dispatches a storage action (upsert, remove, or clear) in a queued manner.

### _createEmbedding

```ts
_createEmbedding: ((item: T) => Promise<readonly [Embeddings, string]>) & IClearableMemoize<string | number> & IControlMemoize<string | number, Promise<readonly [Embeddings, string]>>
```

Creates embeddings for the given item, memoized by item ID to avoid redundant calculations.

### waitForInit

```ts
waitForInit: (() => Promise<void>) & ISingleshotClearable
```

Waits for the initialization of the storage, loading initial data and creating embeddings.
Ensures initialization happens only once using singleshot.

## Methods

### take

```ts
take(search: string, total: number, score?: number): Promise<T[]>;
```

Retrieves a specified number of items based on similarity to a search string.
Uses embeddings and similarity scoring to sort and filter results.

### upsert

```ts
upsert(item: T): Promise<void>;
```

Upserts an item into the storage via the dispatch queue.

### remove

```ts
remove(itemId: IStorageData["id"]): Promise<void>;
```

Removes an item from the storage by its ID via the dispatch queue.

### clear

```ts
clear(): Promise<void>;
```

Clears all items from the storage via the dispatch queue.

### get

```ts
get(itemId: IStorageData["id"]): Promise<T | null>;
```

Retrieves an item from the storage by its ID.
Emits an event with the result.

### list

```ts
list(filter?: (item: T) => boolean): Promise<T[]>;
```

Lists all items in the storage, optionally filtered by a predicate.
Emits an event with the filtered result if a filter is provided.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the storage instance, invoking the onDispose callback if provided.
