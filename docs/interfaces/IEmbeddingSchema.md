# IEmbeddingSchema

Interface representing the schema for configuring an embedding mechanism.
Defines how embeddings are created and compared within the swarm.

## Properties

### persist

```ts
persist: boolean
```

Optional flag to enable serialization of navigation stack and active agent state to persistent storage (e.g., hard drive).

### embeddingName

```ts
embeddingName: string
```

The unique name of the embedding mechanism within the swarm.

### writeEmbeddingCache

```ts
writeEmbeddingCache: (embeddings: number[], embeddingName: string, stringHash: string) => void | Promise<void>
```

Stores an embedding vector for a specific string hash, persisting it for future retrieval.
Used to cache computed embeddings to avoid redundant processing.

### readEmbeddingCache

```ts
readEmbeddingCache: (embeddingName: string, stringHash: string) => number[] | Promise<number[]>
```

Retrieves the embedding vector for a specific string hash, returning null if not found.
Used to check if a precomputed embedding exists in the cache.

### callbacks

```ts
callbacks: Partial<IEmbeddingCallbacks>
```

Optional partial set of callbacks for embedding events, allowing customization of creation and comparison.

## Methods

### createEmbedding

```ts
createEmbedding: (text: string, embeddingName: string) => Promise<Embeddings>
```

Creates an embedding from the provided text.
Typically used for indexing or search operations in storage.

### calculateSimilarity

```ts
calculateSimilarity: (a: Embeddings, b: Embeddings) => Promise<number>
```

Calculates the similarity between two embeddings.
Commonly used for search or ranking operations (e.g., cosine similarity).
