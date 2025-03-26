---
title: docs/api-reference/interface/IPersistEmbeddingControl
group: docs
---

# IPersistEmbeddingControl

Defines control methods for customizing embedding persistence operations.
Allows injection of a custom persistence adapter for embedding data tied to `EmbeddingName`.

## Methods

### usePersistEmbeddingAdapter

```ts
usePersistEmbeddingAdapter: (Ctor: TPersistBaseCtor<string, IPersistEmbeddingData>) => void
```

Sets a custom persistence adapter for embedding data storage.
Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory tracking for `SwarmName`).
