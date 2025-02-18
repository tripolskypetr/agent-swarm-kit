# IEmbeddingSchema

## Properties

### embeddingName

```ts
embeddingName: string
```

### callbacks

```ts
callbacks: Partial<IEmbeddingCallbacks>
```

## Methods

### createEmbedding

```ts
createEmbedding: (text: string) => Promise<Embeddings>
```

### calculateSimilarity

```ts
calculateSimilarity: (a: Embeddings, b: Embeddings) => Promise<number>
```
