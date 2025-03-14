# StoragePublicService

Implements `TStorageConnectionService`

Service for managing public storage interactions.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### storageConnectionService

```ts
storageConnectionService: any
```

### take

```ts
take: (search: string, total: number, methodName: string, clientId: string, storageName: string, score?: number) => Promise<IStorageData[]>
```

Retrieves a list of storage data based on a search query and total number of items.

### upsert

```ts
upsert: (item: IStorageData, methodName: string, clientId: string, storageName: string) => Promise<void>
```

Upserts an item in the storage.

### remove

```ts
remove: (itemId: StorageId, methodName: string, clientId: string, storageName: string) => Promise<void>
```

Removes an item from the storage.

### get

```ts
get: (itemId: StorageId, methodName: string, clientId: string, storageName: string) => Promise<IStorageData>
```

Retrieves an item from the storage by its ID.

### list

```ts
list: (methodName: string, clientId: string, storageName: string, filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>
```

Retrieves a list of items from the storage, optionally filtered by a predicate function.

### clear

```ts
clear: (methodName: string, clientId: string, storageName: string) => Promise<void>
```

Clears all items from the storage.

### dispose

```ts
dispose: (methodName: string, clientId: string, storageName: string) => Promise<void>
```

Disposes of the storage.
