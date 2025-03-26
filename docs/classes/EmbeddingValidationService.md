---
title: docs/api-reference/class/EmbeddingValidationService
group: docs
---

# EmbeddingValidationService

Service for validating embedding names within the swarm system.
Manages a map of registered embeddings, ensuring their uniqueness and existence during validation.
Integrates with EmbeddingSchemaService (embedding registration), ClientStorage (embedding usage in similarity search),
AgentValidationService (potential embedding validation for agents), and LoggerService (logging).
Uses dependency injection for the logger and memoization for efficient validation checks.

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

### _embeddingMap

```ts
_embeddingMap: any
```

Map of embedding names to their schemas, used to track and validate embeddings.
Populated by addEmbedding, queried by validate.

### addEmbedding

```ts
addEmbedding: (embeddingName: string, embeddingSchema: IEmbeddingSchema) => void
```

Registers a new embedding with its schema in the validation service.
Logs the operation and ensures uniqueness, supporting EmbeddingSchemaService’s registration process.

### validate

```ts
validate: (embeddingName: string, source: string) => void
```

Validates if an embedding name exists in the registered map, memoized by embeddingName for performance.
Logs the operation and checks existence, supporting ClientStorage’s embedding-based search validation.
