# IEmbeddingSchema

Interface representing the schema for configuring an embedding mechanism.
Defines how embeddings are created and compared within the swarm.

## Properties

### embeddingName

```ts
embeddingName: string
```

The unique name of the embedding mechanism within the swarm.

### callbacks

```ts
callbacks: Partial<IEmbeddingCallbacks>
```

Optional partial set of callbacks for embedding events, allowing customization of creation and comparison.

## Methods

### createEmbedding

```ts
createEmbedding: (text: string) => Promise<Embeddings>
```

Creates an embedding from the provided text.
Typically used for indexing or search operations in storage.

### calculateSimilarity

```ts
calculateSimilarity: (a: Embeddings, b: Embeddings) => Promise<number>
```

Calculates the similarity between two embeddings.
Commonly used for search or ranking operations (e.g., cosine similarity).
