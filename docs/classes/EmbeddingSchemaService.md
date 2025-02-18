# EmbeddingSchemaService

Service for managing embedding schemas.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### registry

```ts
registry: any
```

### register

```ts
register: (key: string, value: IEmbeddingSchema) => void
```

Registers a embedding with the given key and value.

### get

```ts
get: (key: string) => IEmbeddingSchema
```

Retrieves a embedding by its key.
