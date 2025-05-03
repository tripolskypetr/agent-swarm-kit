---
title: docs/api-reference/class/SharedComputePublicService
group: docs
---

# SharedComputePublicService

Implements `TSharedComputeConnectionService`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### sharedComputeConnectionService

```ts
sharedComputeConnectionService: any
```

### getComputeData

```ts
getComputeData: (methodName: string, computeName: string) => Promise<T>
```

### calculate

```ts
calculate: (stateName: string, methodName: string, computeName: string) => Promise<void>
```

### update

```ts
update: (methodName: string, computeName: string) => Promise<void>
```
