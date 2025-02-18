# EmbeddingValidationService

Service for validating embeddings within the agent-swarm.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### _embeddingMap

```ts
_embeddingMap: any
```

### addEmbedding

```ts
addEmbedding: (embeddingName: string, embeddingSchema: IEmbeddingSchema) => void
```

Adds a new embedding to the validation service.

### validate

```ts
validate: (embeddingName: string, source: string) => void
```

Validates if a embedding exists in the validation service.
