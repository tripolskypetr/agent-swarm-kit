# IEmbeddingCallbacks

Interface for embedding callbacks.

## Methods

### onCreate

```ts
onCreate: (text: string, embeddings: Embeddings, clientId: string, embeddingName: string) => void
```

Callback for when an embedding is created.

### onCompare

```ts
onCompare: (text1: string, text2: string, similarity: number, clientId: string, embeddingName: string) => void
```

Callback for when embeddings are compared.
