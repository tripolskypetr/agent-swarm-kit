# StorageSchemaService

Service for managing storage schemas.

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

Validation for storage schema

### register

```ts
register: (key: string, value: IStorageSchema<IStorageData>) => void
```

Registers a new storage schema.

### get

```ts
get: (key: string) => IStorageSchema<IStorageData>
```

Retrieves a storage schema by key.
