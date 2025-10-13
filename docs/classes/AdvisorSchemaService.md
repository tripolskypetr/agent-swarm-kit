---
title: docs/api-reference/class/AdvisorSchemaService
group: docs
---

# AdvisorSchemaService

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

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

### validateShallow

```ts
validateShallow: any
```

Validates basic requirements of an advisor schema

### register

```ts
register: (key: string, value: IAdvisorSchema) => void
```

Registers an advisor schema with a given key

### override

```ts
override: (key: string, value: Partial<IAdvisorSchema>) => IAdvisorSchema
```

Overrides an existing advisor schema with a new value for a given key

### get

```ts
get: (key: string) => IAdvisorSchema
```

Retrieves an advisor schema by key
