---
title: docs/api-reference/interface/IComputeParams
group: docs
---

# IComputeParams

## Properties

### clientId

```ts
clientId: string
```

### logger

```ts
logger: ILogger
```

### bus

```ts
bus: IBus
```

### binding

```ts
binding: IStateChangeContract[]
```

Array of state change contracts for state dependencies.
Defines which state changes trigger compute recalculation and data updates.
