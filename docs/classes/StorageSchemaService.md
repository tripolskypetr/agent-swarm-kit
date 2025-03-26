---
title: docs/api-reference/class/StorageSchemaService
group: docs
---

# StorageSchemaService

Service class for managing storage schemas in the swarm system.
Provides a centralized registry for storing and retrieving IStorageSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
Integrates with StorageConnectionService and SharedStorageConnectionService (storage configuration for ClientStorage), EmbeddingSchemaService (embedding references), AgentSchemaService (storage references in agent schemas), ClientAgent (storage usage in execution), and StoragePublicService (public storage API).
Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
Serves as a foundational service for defining storage configurations (e.g., createIndex function, embedding reference) used by client-specific and shared storage instances within the swarm ecosystem.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

Logger service instance, injected via DI, for logging storage schema operations.
Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StorageConnectionService and PerfService logging patterns.

### registry

```ts
registry: any
```

Registry instance for storing storage schemas, initialized with ToolRegistry from functools-kit.
Maps StorageName keys to IStorageSchema values, providing efficient storage and retrieval, used in register and get methods.
Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.

### validateShallow

```ts
validateShallow: any
```

Validates a storage schema shallowly, ensuring required fields meet basic integrity constraints.
Checks storageName as a string, createIndex as a function (for indexing storage data), and embedding as a string (referencing an EmbeddingName from EmbeddingSchemaService).
Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StorageConnectionService’s configuration needs.
Supports ClientStorage instantiation in StorageConnectionService and SharedStorageConnectionService by ensuring schema validity before registration.

### register

```ts
register: (key: string, value: IStorageSchema<IStorageData>) => void
```

Registers a new storage schema in the registry after validation.
Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (storageName).
Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StorageConnectionService’s storage management.
Supports ClientAgent execution by providing validated storage schemas to StorageConnectionService and SharedStorageConnectionService for ClientStorage configuration.

### get

```ts
get: (key: string) => IStorageSchema<IStorageData>
```

Retrieves a storage schema from the registry by its name.
Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports StorageConnectionService and SharedStorageConnectionService by providing storage configuration (e.g., createIndex, embedding) for ClientStorage instantiation, referenced in AgentSchemaService schemas via the storages field.
