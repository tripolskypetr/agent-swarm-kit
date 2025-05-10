---
title: docs/api-reference/class/MCPSchemaService
group: docs
---

# MCPSchemaService

Service class for managing MCP (Model Context Protocol) schemas.
Provides methods to register, override, and retrieve MCP schemas.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

Injected LoggerService for logging operations.

### schemaContextService

```ts
schemaContextService: { readonly context: ISchemaContext; }
```

Schema context service instance, injected via DI, for managing schema-related context operations.
Provides utilities and methods to interact with schema contexts, supporting schema validation, retrieval, and updates.

### _registry

```ts
_registry: any
```

Registry for storing MCP schemas, keyed by MCP name.

### validateShallow

```ts
validateShallow: any
```

Validates the basic structure of an MCP schema.

### register

```ts
register: (key: string, value: IMCPSchema) => void
```

Registers a new MCP schema in the registry.

### override

```ts
override: (key: string, value: Partial<IMCPSchema>) => IMCPSchema
```

Overrides an existing MCP schema with new or partial values.

### get

```ts
get: (key: string) => IMCPSchema
```

Retrieves an MCP schema by its name.
