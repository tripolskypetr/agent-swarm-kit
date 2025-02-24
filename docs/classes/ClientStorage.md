# ClientStorage

Implements `IStorage<T>`

ClientStorage class to manage storage operations.

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
_itemMap: any
```

### _createEmbedding

```ts
_createEmbedding: ((item: T) => Promise<readonly [Embeddings, string]>) & IClearableMemoize<string | number> & IControlMemoize<string | number, Promise<readonly [Embeddings, string]>>
```

Creates an embedding for the given item.

### waitForInit

```ts
waitForInit: (() => Promise<void>) & ISingleshotClearable
```

Waits for the initialization of the storage.

### take

```ts
take: (search: string, total: number, score?: number) => Promise<T[]>
```

Takes a specified number of items based on the search criteria.

### upsert

```ts
upsert: (item: T) => Promise<void>
```

Upserts an item into the storage.

### remove

```ts
remove: (itemId: StorageId) => Promise<void>
```

Removes an item from the storage.

### clear

```ts
clear: () => Promise<void>
```

Clears all items from the storage.

### get

```ts
get: (itemId: StorageId) => Promise<T>
```

Gets an item by its ID.

### list

```ts
list: (filter?: (item: T) => boolean) => Promise<T[]>
```

Lists all items in the storage, optionally filtered by a predicate.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the state.
