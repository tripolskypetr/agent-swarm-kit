---
title: docs/api-reference/interface/IEmbeddingCallbacks
group: docs
---

# IEmbeddingCallbacks

Interface representing callbacks for embedding lifecycle events.
Provides hooks for creation and comparison of embeddings.

## Methods

### onCreate

```ts
onCreate: (text: string, embeddings: Embeddings, clientId: string, embeddingName: string) => void
```

Callback triggered when an embedding is created.
Useful for logging or post-processing the generated embeddings.

### onCompare

```ts
onCompare: (text1: string, text2: string, similarity: number, clientId: string, embeddingName: string) => void
```

Callback triggered when two embeddings are compared for similarity.
Useful for logging or analyzing similarity results.
