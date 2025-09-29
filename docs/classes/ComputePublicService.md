---
title: docs/api-reference/class/ComputePublicService
group: docs
---

# ComputePublicService

Implements `TComputeConnectionService`

*  *  * Public service for managing compute operations with context-aware execution.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

* Injected logger service for logging operations.

### computeConnectionService

```ts
computeConnectionService: any
```

* Injected compute connection service for compute operations.

### getComputeData

```ts
getComputeData: (methodName: string, clientId: string, computeName: string) => Promise<T>
```

* Retrieves computed data within a method context.
*    *    *    *

### calculate

```ts
calculate: (stateName: string, methodName: string, clientId: string, computeName: string) => Promise<void>
```

* Triggers a recalculation for the compute instance within a method context.
*    *    *    *    *

### update

```ts
update: (methodName: string, clientId: string, computeName: string) => Promise<void>
```

* Forces an update of the compute instance within a method context.
*    *    *    *

### dispose

```ts
dispose: (methodName: string, clientId: string, computeName: string) => Promise<void>
```

* Cleans up the compute instance within a method context.
*    *    *    *
