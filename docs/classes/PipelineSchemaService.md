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

### registry

```ts
registry: any
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
