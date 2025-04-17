---
title: docs/api-reference/class/EmbeddingSchemaService
group: docs
---

# EmbeddingSchemaService

Service class for managing embedding schemas in the swarm system.
Provides a centralized registry for storing and retrieving IEmbeddingSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
Integrates with StorageConnectionService and SharedStorageConnectionService (embedding logic for storage operations like take), ClientAgent (potential embedding use in execution), and AgentSchemaService (embedding references in agent schemas).
Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
Serves as a foundational service for defining embedding logic (e.g., calculateSimilarity and createEmbedding functions) used primarily in storage similarity searches within the swarm ecosystem.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging embedding schema operations.
Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StorageConnectionService and PerfService logging patterns.

### registry

```ts
registry: any
```

Registry instance for storing embedding schemas, initialized with ToolRegistry from functools-kit.
Maps EmbeddingName keys to IEmbeddingSchema values, providing efficient storage and retrieval, used in register and get methods.
Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.

### validateShallow

```ts
validateShallow: any
```

Validates an embedding schema shallowly, ensuring required fields meet basic integrity constraints.
Checks embeddingName as a string and calculateSimilarity and createEmbedding as functions, critical for storage operations in StorageConnectionService and SharedStorageConnectionService.
Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with storage service needs.
Supports storage similarity searches (e.g., take method) by ensuring embedding schema validity before registration.

### register

```ts
register: (key: string, value: IEmbeddingSchema) => void
```

Registers a new embedding schema in the registry after validation.
Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (embeddingName).
Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StorageConnectionService’s embedding usage.
Supports storage operations (e.g., similarity-based retrieval in ClientStorage) by providing validated embedding schemas to StorageConnectionService and SharedStorageConnectionService.

### override

```ts
override: (key: string, value: Partial<IEmbeddingSchema>) => IEmbeddingSchema
```

Overrides an existing embedding schema in the registry with a new one.
Replaces the schema associated with the provided key in the ToolRegistry.
Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports updating embedding logic (e.g., calculateSimilarity and createEmbedding) for storage operations in StorageConnectionService and SharedStorageConnectionService.

### get

```ts
get: (key: string) => IEmbeddingSchema
```

Retrieves an embedding schema from the registry by its name.
Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports StorageConnectionService and SharedStorageConnectionService by providing embedding logic (calculateSimilarity and createEmbedding) for storage operations like take, referenced in storage schemas.
