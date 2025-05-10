---
title: docs/api-reference/class/PipelineSchemaService
group: docs
---

# PipelineSchemaService

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
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

### register

```ts
register: (key: string, value: IPipelineSchema<any>) => void
```

### override

```ts
override: (key: string, value: Partial<IPipelineSchema<any>>) => IPipelineSchema<any>
```

### get

```ts
get: (key: string) => IPipelineSchema<any>
```
