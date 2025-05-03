---
title: docs/api-reference/class/ComputePublicService
group: docs
---

# ComputePublicService

Implements `TComputeConnectionService`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### computeConnectionService

```ts
computeConnectionService: any
```

### getComputeData

```ts
getComputeData: (methodName: string, clientId: string, computeName: string) => Promise<T>
```

### calculate

```ts
calculate: (stateName: string, methodName: string, clientId: string, computeName: string) => Promise<void>
```

### update

```ts
update: (methodName: string, clientId: string, computeName: string) => Promise<void>
```

### dispose

```ts
dispose: (methodName: string, clientId: string, computeName: string) => Promise<void>
```
