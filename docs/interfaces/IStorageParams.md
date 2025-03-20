# IStorageParams

Interface representing the runtime parameters for storage management.
Extends the storage schema with client-specific and embedding-related dependencies.

## Properties

### clientId

```ts
clientId: string
```

The unique ID of the client associated with the storage instance.

### calculateSimilarity

```ts
calculateSimilarity: (a: Embeddings, b: Embeddings) => Promise<number>
```

Function to calculate similarity between embeddings, inherited from the embedding schema.
Used for search operations.

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

### createEmbedding

```ts
createEmbedding: (text: string, embeddingName: string) => Promise<Embeddings>
```

Function to create an embedding for storage items, inherited from the embedding schema.
Used for indexing.

### storageName

```ts
storageName: string
```

The unique name of the storage within the swarm (redundant with schema but included for clarity).

### logger

```ts
logger: ILogger
```

The logger instance for recording storage-related activity and errors.

### bus

```ts
bus: IBus
```

The bus instance for event communication within the swarm.
