# StorageConnectionService

Implements `IStorage`

Service for managing storage connections.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### busService

```ts
busService: any
```

### methodContextService

```ts
methodContextService: any
```

### storageSchemaService

```ts
storageSchemaService: any
```

### sessionValidationService

```ts
sessionValidationService: any
```

### embeddingSchemaService

```ts
embeddingSchemaService: any
```

### sharedStorageConnectionService

```ts
sharedStorageConnectionService: any
```

### _sharedStorageSet

```ts
_sharedStorageSet: any
```

### getStorage

```ts
getStorage: ((clientId: string, storageName: string) => ClientStorage<any>) & IClearableMemoize<string> & IControlMemoize<string, ClientStorage<any>>
```

Retrieves a storage instance based on client ID and storage name.

### take

```ts
take: (search: string, total: number, score?: number) => Promise<IStorageData[]>
```

Retrieves a list of storage data based on a search query and total number of items.

### upsert

```ts
upsert: (item: IStorageData) => Promise<void>
```

Upserts an item in the storage.

### remove

```ts
remove: (itemId: StorageId) => Promise<void>
```

Removes an item from the storage.

### get

```ts
get: (itemId: StorageId) => Promise<IStorageData>
```

Retrieves an item from the storage by its ID.

### list

```ts
list: (filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>
```

Retrieves a list of items from the storage, optionally filtered by a predicate function.

### clear

```ts
clear: () => Promise<void>
```

Clears all items from the storage.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the storage connection.
