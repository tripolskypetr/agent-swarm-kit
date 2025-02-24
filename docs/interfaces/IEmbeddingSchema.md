# IEmbeddingSchema

Interface representing the schema for embeddings.

## Properties

### embeddingName

```ts
embeddingName: string
```

The name of the embedding.

### callbacks

```ts
callbacks: Partial<IEmbeddingCallbacks>
```

Optional callbacks for embedding events.

## Methods

### createEmbedding

```ts
createEmbedding: (text: string) => Promise<Embeddings>
```

Creates an embedding from the given text.

### calculateSimilarity

```ts
calculateSimilarity: (a: Embeddings, b: Embeddings) => Promise<number>
```

Calculates the similarity between two embeddings.
