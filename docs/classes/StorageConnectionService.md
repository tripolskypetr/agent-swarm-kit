---
title: docs/api-reference/class/StorageConnectionService
group: docs
---

# StorageConnectionService

Implements `IStorage`

Service class for managing storage connections and operations in the swarm system.
Implements IStorage to provide an interface for storage instance management, data manipulation, and lifecycle operations, scoped to clientId and storageName.
Handles both client-specific storage and delegates to SharedStorageConnectionService for shared storage, tracked via a _sharedStorageSet.
Integrates with ClientAgent (storage in agent execution), StoragePublicService (public storage API), SharedStorageConnectionService (shared storage delegation), AgentConnectionService (storage initialization), and PerfService (tracking via BusService).
Uses memoization via functools-kit’s memoize to cache ClientStorage instances by a composite key (clientId-storageName), ensuring efficient reuse across calls.
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StorageSchemaService for storage configuration, EmbeddingSchemaService for embedding functionality, SessionValidationService for usage tracking, and SharedStorageConnectionService for shared storage handling.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging storage operations.
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StoragePublicService and PerfService logging patterns.

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
Used to retrieve clientId and storageName in method calls, integrating with MethodContextService’s scoping in StoragePublicService.

### storageSchemaService

```ts
storageSchemaService: any
```

Storage schema service instance, injected via DI, for retrieving storage configurations.
Provides configuration (e.g., persist, getData, embedding) to ClientStorage in getStorage, aligning with AgentMetaService’s schema management.

### sessionValidationService

```ts
sessionValidationService: any
```

Session validation service instance, injected via DI, for tracking storage usage.
Used in getStorage and dispose to manage storage lifecycle, supporting SessionPublicService’s validation needs.

### embeddingSchemaService

```ts
embeddingSchemaService: any
```

Embedding schema service instance, injected via DI, for retrieving embedding configurations.
Provides embedding logic (e.g., calculateSimilarity, createEmbedding) to ClientStorage in getStorage, supporting similarity-based retrieval in take.

### sharedStorageConnectionService

```ts
sharedStorageConnectionService: any
```

Shared storage connection service instance, injected via DI, for delegating shared storage operations.
Used in getStorage to retrieve shared storage instances, integrating with SharedStorageConnectionService’s global storage management.

### _sharedStorageSet

```ts
_sharedStorageSet: any
```

Set of storage names marked as shared, used to track delegation to SharedStorageConnectionService.
Populated in getStorage and checked in dispose to avoid disposing shared storage.

### getStorage

```ts
getStorage: ((clientId: string, storageName: string) => ClientStorage<any>) & IClearableMemoize<string> & IControlMemoize<string, ClientStorage<any>>
```

Retrieves or creates a memoized ClientStorage instance for a given client and storage name.
Uses functools-kit’s memoize to cache instances by a composite key (clientId-storageName), ensuring efficient reuse across calls.
Configures client-specific storage with schema data from StorageSchemaService, embedding logic from EmbeddingSchemaService, and persistence via PersistStorageAdapter or defaults from GLOBAL_CONFIG.
Delegates to SharedStorageConnectionService for shared storage (shared=true), tracking them in _sharedStorageSet.
Supports ClientAgent (storage in EXECUTE_FN), AgentConnectionService (storage initialization), and StoragePublicService (public API).

### take

```ts
take: (search: string, total: number, score?: number) => Promise<IStorageData[]>
```

Retrieves a list of storage data items based on a search query, total count, and optional similarity score.
Delegates to ClientStorage.take after awaiting initialization, using context from MethodContextService to identify the storage, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors StoragePublicService’s take, supporting ClientAgent’s similarity-based data retrieval with embedding support from EmbeddingSchemaService.

### upsert

```ts
upsert: (item: IStorageData) => Promise<void>
```

Upserts an item into the storage, inserting or updating based on its ID.
Delegates to ClientStorage.upsert after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors StoragePublicService’s upsert, supporting ClientAgent’s data persistence.

### remove

```ts
remove: (itemId: StorageId) => Promise<void>
```

Removes an item from the storage by its ID.
Delegates to ClientStorage.remove after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors StoragePublicService’s remove, supporting ClientAgent’s data deletion.

### get

```ts
get: (itemId: StorageId) => Promise<IStorageData>
```

Retrieves an item from the storage by its ID.
Delegates to ClientStorage.get after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors StoragePublicService’s get, supporting ClientAgent’s data access, returning null if the item is not found.

### list

```ts
list: (filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>
```

Retrieves a list of items from the storage, optionally filtered by a predicate function.
Delegates to ClientStorage.list after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors StoragePublicService’s list, supporting ClientAgent’s bulk data access.

### clear

```ts
clear: () => Promise<void>
```

Clears all items from the storage, resetting it to its default state.
Delegates to ClientStorage.clear after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors StoragePublicService’s clear, supporting ClientAgent’s storage reset.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the storage connection, cleaning up resources and clearing the memoized instance for client-specific storage.
Checks if the storage exists in the memoization cache and is not shared (via _sharedStorageSet) before calling ClientStorage.dispose, then clears the cache and updates SessionValidationService.
Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with StoragePublicService’s dispose and PerfService’s cleanup.
Shared storage is not disposed here, as it is managed by SharedStorageConnectionService.
