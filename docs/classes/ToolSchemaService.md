# ToolSchemaService

Service for managing tool schemas.

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

### validateShallow

```ts
validateShallow: any
```

Validation for state schema

### register

```ts
register: (key: string, value: IAgentTool<Record<string, ToolValue>>) => void
```

Registers a tool with the given key and value.

### get

```ts
get: (key: string) => IAgentTool<Record<string, ToolValue>>
```

Retrieves a tool by its key.
