# PolicySchemaService

Service for managing policy schemas.

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

### validateShallow

```ts
validateShallow: any
```

Validation for policy schema

### register

```ts
register: (key: string, value: IPolicySchema) => void
```

Registers a new policy schema.

### get

```ts
get: (key: string) => IPolicySchema
```

Retrieves an policy schema by name.
