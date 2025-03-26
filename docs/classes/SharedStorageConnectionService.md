---
title: docs/api-reference/class/SharedStorageConnectionService
group: docs
---

# SharedStorageConnectionService

Implements `IStorage`

Service class for managing shared storage connections and operations in the swarm system.
Implements IStorage to provide an interface for shared storage instance management, data manipulation, and retrieval, scoped to storageName across all clients (using a fixed clientId of "shared").
Integrates with ClientAgent (shared storage in agent execution), StoragePublicService (client-specific storage counterpart), SharedStoragePublicService (public shared storage API), AgentConnectionService (storage initialization), and PerfService (tracking via BusService).
Uses memoization via functools-kit’s memoize to cache ClientStorage instances by storageName, ensuring a single shared instance across all clients.
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StorageSchemaService for storage configuration and EmbeddingSchemaService for embedding functionality, applying persistence via PersistStorageAdapter or defaults from GLOBAL_CONFIG.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging shared storage operations.
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SharedStoragePublicService and PerfService logging patterns.

### busService

```ts
busService: any
```

Bus service instance, injected via DI, for emitting storage-related events.
Passed to ClientStorage for event propagation (e.g., storage updates), aligning with BusService’s event system in AgentConnectionService.

### methodContextService

```ts
methodContextService: any
```

Method context service instance, injected via DI, for accessing execution context.
Used to retrieve storageName in method calls, integrating with MethodContextService’s scoping in SharedStoragePublicService.

### storageSchemaService

```ts
storageSchemaService: any
```

Storage schema service instance, injected via DI, for retrieving storage configurations.
Provides configuration (e.g., persist, getData, embedding) to ClientStorage in getStorage, aligning with AgentMetaService’s schema management.

### embeddingSchemaService

```ts
embeddingSchemaService: any
```

Embedding schema service instance, injected via DI, for retrieving embedding configurations.
Provides embedding logic (e.g., calculateSimilarity, createEmbedding) to ClientStorage in getStorage, supporting similarity-based retrieval in take.

### getStorage

```ts
getStorage: ((storageName: string) => ClientStorage<any>) & IClearableMemoize<string> & IControlMemoize<string, ClientStorage<any>>
```

Retrieves or creates a memoized ClientStorage instance for a given shared storage name.
Uses functools-kit’s memoize to cache instances by storageName, ensuring a single shared instance across all clients (fixed clientId: "shared").
Configures the storage with schema data from StorageSchemaService, embedding logic from EmbeddingSchemaService, and persistence via PersistStorageAdapter or defaults from GLOBAL_CONFIG, enforcing shared=true via an error check.
Supports ClientAgent (shared storage in EXECUTE_FN), AgentConnectionService (storage initialization), and SharedStoragePublicService (public API).

### take

```ts
take: (search: string, total: number, score?: number) => Promise<IStorageData[]>
```

Retrieves a list of storage data items based on a search query, total count, and optional similarity score.
Delegates to ClientStorage.take after awaiting initialization, using context from MethodContextService to identify the storage, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SharedStoragePublicService’s take, supporting ClientAgent’s similarity-based data retrieval with embedding support from EmbeddingSchemaService.

### upsert

```ts
upsert: (item: IStorageData) => Promise<void>
```

Upserts an item into the shared storage, inserting or updating based on its ID.
Delegates to ClientStorage.upsert after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SharedStoragePublicService’s upsert, supporting ClientAgent’s data persistence.

### remove

```ts
remove: (itemId: StorageId) => Promise<void>
```

Removes an item from the shared storage by its ID.
Delegates to ClientStorage.remove after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SharedStoragePublicService’s remove, supporting ClientAgent’s data deletion.

### get

```ts
get: (itemId: StorageId) => Promise<IStorageData>
```

Retrieves an item from the shared storage by its ID.
Delegates to ClientStorage.get after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SharedStoragePublicService’s get, supporting ClientAgent’s data access.

### list

```ts
list: (filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>
```

Retrieves a list of items from the shared storage, optionally filtered by a predicate function.
Delegates to ClientStorage.list after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SharedStoragePublicService’s list, supporting ClientAgent’s bulk data access.

### clear

```ts
clear: () => Promise<void>
```

Clears all items from the shared storage, resetting it to its default state.
Delegates to ClientStorage.clear after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SharedStoragePublicService’s clear, supporting ClientAgent’s storage reset.
