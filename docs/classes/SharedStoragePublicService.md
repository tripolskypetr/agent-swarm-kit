---
title: docs/api-reference/class/SharedStoragePublicService
group: docs
---

# SharedStoragePublicService

Implements `TSharedStorageConnectionService`

Service class for managing public shared storage operations in the swarm system.
Implements TSharedStorageConnectionService to provide a public API for shared storage interactions, delegating to SharedStorageConnectionService and wrapping calls with MethodContextService for context scoping.
Integrates with ClientAgent (e.g., storing/retrieving data in EXECUTE_FN), PerfService (e.g., tracking storage usage in sessionState), and DocService (e.g., documenting storage schemas via storageName).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like retrieving, upserting, removing, listing, and clearing items in shared storage across the system.

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
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SharedStatePublicService and PerfService logging patterns.
   *

### sharedStorageConnectionService

```ts
sharedStorageConnectionService: any
```

Shared storage connection service instance, injected via DI, for underlying storage operations.
Provides core functionality (e.g., take, upsert) called by public methods, supporting ClientAgent’s storage needs.
   *

### take

```ts
take: (search: string, total: number, methodName: string, storageName: string, score?: number) => Promise<IStorageData[]>
```

Retrieves a list of storage items based on a search query, total count, and optional score, from a storage identified by storageName.
Wraps SharedStorageConnectionService.take with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., searching storage in EXECUTE_FN) and DocService (e.g., documenting searchable storage data).
   *    *    *    *    *

### upsert

```ts
upsert: (item: IStorageData, methodName: string, storageName: string) => Promise<void>
```

Upserts (inserts or updates) an item in the shared storage identified by storageName.
Wraps SharedStorageConnectionService.upsert with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., storing data in EXECUTE_FN) and PerfService (e.g., tracking storage updates in sessionState).
   *    *    *

### remove

```ts
remove: (itemId: StorageId, methodName: string, storageName: string) => Promise<void>
```

Removes an item from the shared storage identified by storageName, using the item’s ID.
Wraps SharedStorageConnectionService.remove with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., deleting data in EXECUTE_FN) and PerfService (e.g., tracking storage cleanup).
   *    *    *

### get

```ts
get: (itemId: StorageId, methodName: string, storageName: string) => Promise<IStorageData>
```

Retrieves a specific item from the shared storage identified by storageName, using the item’s ID.
Wraps SharedStorageConnectionService.get with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., fetching data in EXECUTE_FN) and PerfService (e.g., reading storage for metrics).
   *    *    *

### list

```ts
list: (methodName: string, storageName: string, filter?: (item: IStorageData) => boolean) => Promise<IStorageData[]>
```

Retrieves a list of all items from the shared storage identified by storageName, optionally filtered by a predicate function.
Wraps SharedStorageConnectionService.list with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., listing storage in EXECUTE_FN) and DocService (e.g., documenting storage contents).
   *    *    *

### clear

```ts
clear: (methodName: string, storageName: string) => Promise<void>
```

Clears all items from the shared storage identified by storageName.
Wraps SharedStorageConnectionService.clear with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., resetting storage in EXECUTE_FN) and PerfService (e.g., clearing storage for performance resets).
   *    *
