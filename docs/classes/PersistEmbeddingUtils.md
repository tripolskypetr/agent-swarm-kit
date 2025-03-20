# PersistEmbeddingUtils

Implements `IPersistEmbeddingControl`

Utility class for managing embedding data persistence in the swarm system.
Provides methods to read and write embedding vectors with a customizable adapter.

## Constructor

```ts
constructor();
```

## Properties

### PersistEmbeddingFactory

```ts
PersistEmbeddingFactory: any
```

### getEmbeddingStorage

```ts
getEmbeddingStorage: any
```

Memoized function to create or retrieve storage for specific embedding data.
Ensures a single persistence instance per embedding name, optimizing resource use.

### readEmbeddingCache

```ts
readEmbeddingCache: (embeddingName: string, stringHash: string) => Promise<number[]>
```

Retrieves the embedding vector for a specific string hash, returning null if not found.
Used to check if a precomputed embedding exists in the cache.

### writeEmbeddingCache

```ts
writeEmbeddingCache: (embeddings: number[], embeddingName: string, stringHash: string) => Promise<void>
```

Stores an embedding vector for a specific string hash, persisting it for future retrieval.
Used to cache computed embeddings to avoid redundant processing.

## Methods

### usePersistEmbeddingAdapter

```ts
usePersistEmbeddingAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistEmbeddingData>): void;
```

Configures a custom constructor for embedding data persistence, overriding the default `PersistBase`.
Enables advanced tracking (e.g., in-memory or database-backed persistence).
