# SharedStorageUtils

Implements `TSharedStorage`

## Constructor

```ts
constructor();
```

## Properties

### take

```ts
take: <T extends IStorageData = IStorageData>(payload: { search: string; total: number; agentName: string; storageName: string; score?: number; }) => Promise<T[]>
```

Takes items from the storage.

### upsert

```ts
upsert: <T extends IStorageData = IStorageData>(payload: { item: T; agentName: string; storageName: string; }) => Promise<void>
```

Upserts an item in the storage.

### remove

```ts
remove: (payload: { itemId: StorageId; agentName: string; storageName: string; }) => Promise<void>
```

Removes an item from the storage.

### get

```ts
get: <T extends IStorageData = IStorageData>(payload: { itemId: StorageId; agentName: string; storageName: string; }) => Promise<T>
```

Gets an item from the storage.

### list

```ts
list: <T extends IStorageData = IStorageData>(payload: { agentName: string; storageName: string; filter?: (item: T) => boolean; }) => Promise<T[]>
```

Lists items from the storage.

### clear

```ts
clear: (payload: { agentName: string; storageName: string; }) => Promise<void>
```

Clears the storage.
