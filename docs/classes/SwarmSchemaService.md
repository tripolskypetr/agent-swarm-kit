# SwarmSchemaService

Service for managing swarm schemas.

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

Validation for swarm schema

### register

```ts
register: (key: string, value: ISwarmSchema) => void
```

Registers a new swarm schema.

### get

```ts
get: (key: string) => ISwarmSchema
```

Retrieves a swarm schema by its name.
