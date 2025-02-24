# StateSchemaService

Service for managing state schemas.

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
register: (key: string, value: IStateSchema<any>) => void
```

Registers a new state schema.

### get

```ts
get: (key: string) => IStateSchema<any>
```

Retrieves a state schema by key.
