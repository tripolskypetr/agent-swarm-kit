# AgentSchemaService

Service for managing agent schemas.

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

Validation for agent schema

### register

```ts
register: (key: string, value: IAgentSchema) => void
```

Registers a new agent schema.

### get

```ts
get: (key: string) => IAgentSchema
```

Retrieves an agent schema by name.
