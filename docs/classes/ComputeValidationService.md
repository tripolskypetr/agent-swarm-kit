---
title: docs/api-reference/class/ComputeValidationService
group: docs
---

# ComputeValidationService

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### stateValidationService

```ts
stateValidationService: any
```

### stateSchemaService

```ts
stateSchemaService: any
```

### _computeMap

```ts
_computeMap: any
```

### addCompute

```ts
addCompute: (computeName: string, computeSchema: IComputeSchema<any>) => void
```

### getComputeList

```ts
getComputeList: () => string[]
```

### validate

```ts
validate: (computeName: string, source: string) => void
```
