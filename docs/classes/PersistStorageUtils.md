# PersistStorageUtils

Implements `IPersistStorageControl`

Utility class for managing storage persistence per client (`SessionId`) and storage name (`StorageName`) in the swarm system.
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
Ensures a single persistence instance per `StorageName`, optimizing resource use.

### getData

```ts
getData: <T extends IStorageData = IStorageData>(clientId: string, storageName: string, defaultValue: T[]) => Promise<T[]>
```

Retrieves the data for a client from a specific storage, falling back to a default if unset.
Accesses persistent storage for a `SessionId` under a `StorageName` (e.g., user records).

### setData

```ts
setData: <T extends IStorageData = IStorageData>(data: T[], clientId: string, storageName: string) => Promise<void>
```

Sets the data for a client in a specific storage, persisting it for future retrieval.
Stores data for a `SessionId` under a `StorageName` (e.g., user logs).

## Methods

### usePersistStorageAdapter

```ts
usePersistStorageAdapter(Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>): void;
```

Configures a custom constructor for storage persistence, overriding the default `PersistBase`.
Enables advanced storage options for `StorageName` (e.g., database-backed persistence).
