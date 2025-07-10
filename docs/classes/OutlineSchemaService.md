---
title: docs/api-reference/class/OutlineSchemaService
group: docs
---

# OutlineSchemaService

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
register: (key: string, value: IOutlineSchema<any, any>) => void
```

### override

```ts
override: (key: string, value: Partial<IOutlineSchema<any, any>>) => IOutlineSchema<any, any>
```

### get

```ts
get: (key: string) => IOutlineSchema<any, any>
```
