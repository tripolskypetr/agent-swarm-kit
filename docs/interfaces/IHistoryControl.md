---
title: docs/api-reference/interface/IHistoryControl
group: docs
---

# IHistoryControl

Interface defining control methods for configuring history behavior.

## Properties

### useHistoryCallbacks

```ts
useHistoryCallbacks: (Callbacks: Partial<IHistoryInstanceCallbacks>) => void
```

Configures lifecycle callbacks for history instances.

## Methods

### useHistoryAdapter

```ts
useHistoryAdapter: (Ctor: THistoryInstanceCtor) => void
```

Sets a custom history instance constructor for the adapter.
