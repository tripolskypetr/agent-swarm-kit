---
title: docs/api-reference/function/addEmbedding
group: docs
---

# addEmbedding

```ts
declare function addEmbedding(embeddingSchema: IEmbeddingSchema): string;
```

Adds a new embedding engine to the embedding registry for use within the swarm system.

This function registers a new embedding engine, enabling the swarm to utilize it for tasks such as vector generation or similarity comparisons.
Only embeddings registered through this function are recognized by the swarm. The execution is wrapped in `beginContext` to ensure it runs
outside of existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled
and returns the embedding's name upon successful registration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `embeddingSchema` | |
