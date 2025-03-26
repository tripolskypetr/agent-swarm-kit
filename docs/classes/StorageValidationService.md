---
title: docs/api-reference/class/StorageValidationService
group: docs
---

# StorageValidationService

Service for validating storage configurations within the swarm system.
Manages a map of registered storages, ensuring their uniqueness, existence, and valid embedding configurations.
Integrates with StorageSchemaService (storage registration), ClientStorage (storage operations),
AgentValidationService (validating agent storages), EmbeddingValidationService (embedding validation),
and LoggerService (logging).
Uses dependency injection for services and memoization for efficient validation checks.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance for logging validation operations and errors.
Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

### embeddingValidationService

```ts
embeddingValidationService: any
```

Embedding validation service instance for validating embeddings associated with storages.
Injected via DI, used in validate method to check storage.embedding.

### _storageMap

```ts
_storageMap: any
```

Map of storage names to their schemas, used to track and validate storages.
Populated by addStorage, queried by validate.

### addStorage

```ts
addStorage: (storageName: string, storageSchema: IStorageSchema<IStorageData>) => void
```

Registers a new storage with its schema in the validation service.
Logs the operation and ensures uniqueness, supporting StorageSchemaService’s registration process.

### validate

```ts
validate: (storageName: string, source: string) => void
```

Validates a storage by its name and source, memoized by storageName for performance.
Checks storage existence and validates its embedding, supporting ClientStorage’s operational integrity.
