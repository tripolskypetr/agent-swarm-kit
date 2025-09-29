---
title: docs/api-reference/interface/IComputeCallbacks
group: docs
---

# IComputeCallbacks

## Properties

### onInit

```ts
onInit: (clientId: string, computeName: string) => void
```

### onDispose

```ts
onDispose: (clientId: string, computeName: string) => void
```

### onCompute

```ts
onCompute: (data: T, clientId: string, computeName: string) => void
```

### onCalculate

```ts
onCalculate: (stateName: string, clientId: string, computeName: string) => void
```

### onUpdate

```ts
onUpdate: (clientId: string, computeName: string) => void
```

Called when the compute is updated.
Triggered whenever compute data or configuration changes, allowing for reactive updates.
