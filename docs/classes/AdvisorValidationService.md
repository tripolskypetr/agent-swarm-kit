---
title: docs/api-reference/class/AdvisorValidationService
group: docs
---

# AdvisorValidationService

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### _advisorMap

```ts
_advisorMap: any
```

### addAdvisor

```ts
addAdvisor: (advisorName: string, advisorSchema: IAdvisorSchema<string>) => void
```

Adds an advisor schema to the validation service

### validate

```ts
validate: (advisorName: string, source: string) => void
```

Validates the existence of an advisor
