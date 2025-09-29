---
title: docs/api-reference/function/overrideEmbeding
group: docs
---

# overrideEmbeding

```ts
declare function overrideEmbeding(embeddingSchema: TEmbeddingSchema): IEmbeddingSchema;
```

Overrides an existing embedding schema in the swarm system with a new or partial schema.
This function updates the configuration of an embedding mechanism identified by its `embeddingName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `embeddingSchema` | The schema definition for embedding. |
