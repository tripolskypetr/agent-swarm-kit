---
title: docs/api-reference/class/StoragePublicService
group: docs
---

# StoragePublicService

Implements `TStorageConnectionService`

Service class for managing public client-specific storage operations in the swarm system.
Implements TStorageConnectionService to provide a public API for storage interactions, delegating to StorageConnectionService and wrapping calls with MethodContextService for context scoping.
Integrates with ClientAgent (e.g., storing/retrieving client-specific data in EXECUTE_FN), PerfService (e.g., tracking storage usage in sessionState per clientId), and DocService (e.g., documenting storage schemas via storageName).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like retrieving, upserting, removing, listing, clearing, and disposing client-specific storage.
Contrasts with SharedStoragePublicService (system-wide storage) by scoping storage to individual clients via clientId.

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
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StatePublicService and PerfService logging patterns.
   *

### storageConnectionService

```ts
storageConnectionService: any
```

Storage connection service instance, injected via DI, for underlying storage operations.
Provides core functionality (e.g., take, upsert) called by public methods, supporting ClientAgent’s client-specific storage needs.
   *

### take

```ts
take: (search: string, total: number, methodName: string, clientId: string, storageName: string, score?: number) => Promise<IStorageData[]>
```

Retrieves a list of storage items based on a search query, total count, and optional score, from a client-specific storage identified by storageName and clientId.
Wraps StorageConnectionService.take with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., searching client-specific storage in EXECUTE_FN) and DocService (e.g., documenting searchable storage data per client).
   *    *    *    *    *    *

### upsert

```ts
upsert: (item: IStorageData, methodName: string, clientId: string, storageName: string) => Promise<void>
```

Upserts (inserts or updates) an item in the client-specific storage identified by storageName and clientId.
Wraps StorageConnectionService.upsert with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., storing client-specific data in EXECUTE_FN) and PerfService (e.g., tracking storage updates in sessionState per client).
   *    *    *    *

### remove

```ts
remove: (itemId: StorageId, methodName: string, clientId: string, storageName: string) => Promise<void>
```

Removes an item from the client-specific storage identified by storageName and clientId, using the item’s ID.
Wraps StorageConnectionService.remove with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., deleting client-specific data in EXECUTE_FN) and PerfService (e.g., tracking storage cleanup per client).
   *    *    *    *

### get

```ts
get: (itemId: StorageId, methodName: string, clientId: string, storageName: string) => Promise<IStorageData>
```

Retrieves a specific item from the client-specific storage identified by storageName and clientId, using the item’s ID.
Wraps StorageConnectionService.get with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., fetching client-specific data in EXECUTE_FN) and PerfService (e.g., reading storage for metrics per client).
   *    *    *    *

### list

```ts
list: (methodName: string, clientId: string, storageName: string, filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>
```

Retrieves a list of all items from the client-specific storage identified by storageName and clientId, optionally filtered by a predicate function.
Wraps StorageConnectionService.list with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., listing client-specific storage in EXECUTE_FN) and DocService (e.g., documenting storage contents per client).
   *    *    *    *

### clear

```ts
clear: (methodName: string, clientId: string, storageName: string) => Promise<void>
```

Clears all items from the client-specific storage identified by storageName and clientId.
Wraps StorageConnectionService.clear with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., resetting client-specific storage in EXECUTE_FN) and PerfService (e.g., clearing storage for performance resets per client).
   *    *    *

### dispose

```ts
dispose: (methodName: string, clientId: string, storageName: string) => Promise<void>
```

Disposes of the client-specific storage identified by storageName and clientId, cleaning up resources.
Wraps StorageConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN) and PerfService’s dispose (e.g., clearing client-specific storage).
   *    *    *
