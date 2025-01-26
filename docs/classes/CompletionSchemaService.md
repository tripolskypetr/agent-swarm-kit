# CompletionSchemaService

Service for managing completion schemas.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

### registry

```ts
registry: any
```

### register

```ts
register: (key: string, value: ICompletionSchema) => void
```

Registers a new completion schema.

### get

```ts
get: (key: string) => ICompletionSchema
```

Retrieves a completion schema by key.
