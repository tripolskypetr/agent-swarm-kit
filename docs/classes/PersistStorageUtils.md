# PersistStorageUtils

Implements `IPersistStorageControl`

Utility class for managing storage persistence

## Constructor

```ts
constructor();
```

## Properties

### PersistStorageFactory

```ts
PersistStorageFactory: any
```

### getPersistStorage

```ts
getPersistStorage: any
```

Memoized function to get storage for a specific storage name

### getData

```ts
getData: <T extends IStorageData = IStorageData>(clientId: string, storageName: string, defaultValue: T[]) => Promise<T[]>
```

Gets the data for a client from a specific storage

### setData

```ts
setData: <T extends IStorageData = IStorageData>(data: T[], clientId: string, storageName: string) => Promise<void>
```

Sets the data for a client in a specific storage

## Methods

### usePersistStorageAdapter

```ts
usePersistStorageAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>): void;
```

Sets the factory for storage persistence
