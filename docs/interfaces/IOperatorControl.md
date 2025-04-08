---
title: docs/api-reference/interface/IOperatorControl
group: docs
---

# IOperatorControl

Operator control interface

## Properties

### useOperatorCallbacks

```ts
useOperatorCallbacks: (Callbacks: Partial<IOperatorInstanceCallbacks>) => void
```

Sets operator callbacks

## Methods

### useOperatorAdapter

```ts
useOperatorAdapter: (Ctor: TOperatorInstanceCtor) => void
```

Sets custom operator adapter
