---
title: docs/api-reference/class/SharedComputePublicService
group: docs
---

# SharedComputePublicService

Implements `TSharedComputeConnectionService`

*  *  * Public service for managing shared compute operations with context-aware execution.

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

### sharedComputeConnectionService

```ts
sharedComputeConnectionService: any
```

* Injected shared compute connection service for compute operations.

### getComputeData

```ts
getComputeData: (methodName: string, computeName: string) => Promise<T>
```

* Retrieves computed data for a shared compute within a method context.
*    *    *

### calculate

```ts
calculate: (stateName: string, methodName: string, computeName: string) => Promise<void>
```

* Triggers a recalculation for the shared compute instance within a method context.
*    *    *    *

### update

```ts
update: (methodName: string, computeName: string) => Promise<void>
```

* Forces an update of the shared compute instance within a method context.
*    *    *
