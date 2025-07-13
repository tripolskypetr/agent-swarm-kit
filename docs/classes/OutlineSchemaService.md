---
title: docs/api-reference/class/OutlineSchemaService
group: docs
---

# OutlineSchemaService

A service class for managing outline schemas within the agent swarm system.
Provides methods to register, override, and retrieve outline schemas, utilizing a `ToolRegistry` for storage.
Integrates with dependency injection and context services for logging and schema management.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

The logger service instance for recording service-related activity and errors.
Injected via dependency injection using `TYPES.loggerService`.

### schemaContextService

```ts
schemaContextService: { readonly context: ISchemaContext; }
```

The schema context service instance for managing context-specific schema registries.
Injected via dependency injection using `TYPES.schemaContextService`.

### _registry

```ts
_registry: any
```

The internal registry for storing outline schemas, mapping `OutlineName` to `IOutlineSchema`.

### validateShallow

```ts
validateShallow: any
```

Validates an outline schema for required properties and correct types.
Ensures `outlineName` is a string, `getOutlineHistory` is a function, and `validations` (if present) is an array of valid validation functions or objects.
Logs validation attempts if `CC_LOGGER_ENABLE_INFO` is enabled.

### register

```ts
register: (key: string, value: IOutlineSchema<any, any>) => void
```

Registers an outline schema with the specified key in the active registry.
Validates the schema before registration and logs the operation if `CC_LOGGER_ENABLE_INFO` is enabled.

### override

```ts
override: (key: string, value: Partial<IOutlineSchema<any, any>>) => IOutlineSchema<any, any>
```

Overrides an existing outline schema with partial updates for the specified key.
Logs the operation if `CC_LOGGER_ENABLE_INFO` is enabled and returns the updated schema.

### get

```ts
get: (key: string) => IOutlineSchema<any, any>
```

Retrieves an outline schema by its key from the active registry.
Logs the operation if `CC_LOGGER_ENABLE_INFO` is enabled.
