---
title: docs/api-reference/class/ComputeSchemaService
group: docs
---

# ComputeSchemaService

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

### register

```ts
register: (key: string, value: IComputeSchema<any>) => void
```

### override

```ts
override: (key: string, value: Partial<IComputeSchema<any>>) => IComputeSchema<any>
```

### get

```ts
get: (key: string) => IComputeSchema<any>
```
