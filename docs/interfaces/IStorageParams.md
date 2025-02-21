# IStorageParams

Interface representing the parameters for storage.

## Properties

### clientId

```ts
clientId: string
```

The client ID.

### calculateSimilarity

```ts
calculateSimilarity: (a: Embeddings, b: Embeddings) => Promise<number>
```

Function to calculate similarity.

### createEmbedding

```ts
createEmbedding: (text: string) => Promise<Embeddings>
```

Function to create an embedding.

### storageName

```ts
storageName: string
```

The name of the storage.

### logger

```ts
logger: ILogger
```

Logger instance.
