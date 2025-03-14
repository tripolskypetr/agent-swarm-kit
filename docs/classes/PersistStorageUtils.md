# PersistStorageUtils

Utility class for managing storage persistence

## Constructor

```ts
constructor();
```

## Properties

### getPersistStorage

```ts
getPersistStorage: any
```

Memoized function to get storage for a specific storage name

### getData

```ts
getData: <T extends IStorageData$1 = IStorageData$1>(clientId: string, storageName: StorageName$1, defaultValue: T[]) => Promise<T[]>
```

Gets the data for a client from a specific storage

### setData

```ts
setData: <T extends IStorageData$1 = IStorageData$1>(data: T[], clientId: string, storageName: StorageName$1) => Promise<void>
```

Sets the data for a client in a specific storage
