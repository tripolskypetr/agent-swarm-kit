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
