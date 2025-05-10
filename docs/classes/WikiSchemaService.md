---
title: docs/api-reference/class/WikiSchemaService
group: docs
---

# WikiSchemaService

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

Validates basic requirements of a wiki schema

### register

```ts
register: (key: string, value: IWikiSchema) => void
```

Registers a wiki schema with a given key

### override

```ts
override: (key: string, value: Partial<IWikiSchema>) => IWikiSchema
```

Overrides an existing wiki schema with a new value for a given key

### get

```ts
get: (key: string) => IWikiSchema
```

Retrieves a wiki schema by key
