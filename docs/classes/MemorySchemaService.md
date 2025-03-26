---
title: docs/api-reference/class/MemorySchemaService
group: docs
---

# MemorySchemaService

Service class for managing in-memory data for different sessions in the swarm system.
Provides a simple key-value store using a Map, associating SessionId (as clientId) with arbitrary objects, with methods to write, read, and dispose of session-specific memory data.
Integrates with SessionConnectionService (session-specific memory management), ClientAgent (potential runtime memory for agents), PerfService (tracking via logging), and SessionPublicService (public session API).
Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during write, read, and dispose operations.
Acts as a lightweight, non-persistent memory layer for session-scoped data, distinct from StateConnectionService or StorageConnectionService, with no schema validation or persistence.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging memory operations.
Used in writeValue, readValue, and dispose methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionConnectionService and PerfService logging patterns.

### memoryMap

```ts
memoryMap: any
```

Map instance for storing session-specific memory data.
Maps SessionId (as clientId) to arbitrary objects, providing a simple in-memory store, used in writeValue, readValue, and dispose methods.
Not persisted, serving as a transient memory layer for session runtime data.

### writeValue

```ts
writeValue: <T extends object = object>(clientId: string, value: T) => T
```

Writes a value to the memory map for a given client ID, merging it with existing data.
Merges the provided value with any existing object for the clientId using Object.assign, then stores the result in the memoryMap, returning the merged value.
Logs the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SessionConnectionService’s session data needs.
Supports ClientAgent by providing a flexible, session-scoped memory store for runtime data.

### readValue

```ts
readValue: <T extends object = object>(clientId: string) => T
```

Reads a value from the memory map for a given client ID, returning an empty object if not found.
Retrieves the stored object for the clientId from the memoryMap, defaulting to an empty object if no entry exists, cast to the generic type T.
Logs the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SessionPublicService’s data access needs.
Supports ClientAgent by providing access to session-scoped runtime memory.

### dispose

```ts
dispose: (clientId: string) => void
```

Disposes of the memory map entry for a given client ID, removing it from storage.
Deletes the entry associated with the clientId from the memoryMap, effectively clearing session-specific data.
Logs the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SessionConnectionService’s cleanup needs.
Supports session termination or reset scenarios in SessionPublicService and ClientAgent workflows.
