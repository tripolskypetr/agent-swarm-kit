# PersistStorageUtils

Implements `IPersistStorageControl`

Utility class for managing storage persistence per client and storage name.
Provides methods to get/set storage data with a customizable persistence adapter.

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

Memoized function to create or retrieve storage for a specific storage name.
Ensures a single instance per storage name.

### getData

```ts
getData: <T extends IStorageData = IStorageData>(clientId: string, storageName: string, defaultValue: T[]) => Promise<T[]>
```

Retrieves the data for a client from a specific storage, falling back to a default if not set.

### setData

```ts
setData: <T extends IStorageData = IStorageData>(data: T[], clientId: string, storageName: string) => Promise<void>
```

Sets the data for a client in a specific storage.
Persists the data wrapped in an IPersistStorageData structure.

## Methods

### usePersistStorageAdapter

```ts
usePersistStorageAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>): void;
```

Sets a custom constructor for storage persistence, overriding the default PersistBase.
