# IStorage

Interface representing the storage.

## Methods

### take

```ts
take: (search: string, total: number, score?: number) => Promise<T[]>
```

Function to take items from the storage.

### upsert

```ts
upsert: (item: T) => Promise<void>
```

Function to upsert an item in the storage.

### remove

```ts
remove: (itemId: StorageId) => Promise<void>
```

Function to remove an item from the storage.

### get

```ts
get: (itemId: StorageId) => Promise<T>
```

Function to get an item from the storage.

### list

```ts
list: (filter?: (item: T) => boolean) => Promise<T[]>
```

Function to list items from the storage.

### clear

```ts
clear: () => Promise<void>
```

Function to clear the storage.
