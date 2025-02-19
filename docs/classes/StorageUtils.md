# StorageUtils

Implements `TStorage`

## Constructor

```ts
constructor();
```

## Properties

### take

```ts
take: <T extends IStorageData = IStorageData>(payload: { search: string; total: number; clientId: string; agentName: string; storageName: string; score?: number; }) => Promise<T[]>
```

Takes items from the storage.

### upsert

```ts
upsert: <T extends IStorageData = IStorageData>(payload: { item: T; clientId: string; agentName: string; storageName: string; }) => Promise<void>
```

Upserts an item in the storage.

### remove

```ts
remove: (payload: { itemId: StorageId; clientId: string; agentName: string; storageName: string; }) => Promise<void>
```

Removes an item from the storage.

### get

```ts
get: <T extends IStorageData = IStorageData>(payload: { itemId: StorageId; clientId: string; agentName: string; storageName: string; }) => Promise<T>
```

Gets an item from the storage.

### list

```ts
list: <T extends IStorageData = IStorageData>(payload: { clientId: string; agentName: string; storageName: string; filter?: (item: T) => boolean; }) => Promise<T[]>
```

Lists items from the storage.

### clear

```ts
clear: (payload: { clientId: string; agentName: string; storageName: string; }) => Promise<void>
```

Clears the storage.
