# SharedStorageUtils

Implements `TSharedStorage`

## Constructor

```ts
constructor();
```

## Properties

### take

```ts
take: <T extends IStorageData = IStorageData>(payload: { search: string; total: number; storageName: string; score?: number; }) => Promise<T[]>
```

Takes items from the storage.

### upsert

```ts
upsert: <T extends IStorageData = IStorageData>(item: T, storageName: string) => Promise<void>
```

Upserts an item in the storage.

### remove

```ts
remove: (itemId: StorageId, storageName: string) => Promise<void>
```

Removes an item from the storage.

### get

```ts
get: <T extends IStorageData = IStorageData>(itemId: StorageId, storageName: string) => Promise<T>
```

Gets an item from the storage.

### list

```ts
list: <T extends IStorageData = IStorageData>(storageName: string, filter?: (item: T) => boolean) => Promise<T[]>
```

Lists items from the storage.

### clear

```ts
clear: (storageName: string) => Promise<void>
```

Clears the storage.
