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

### createEmbedding

```ts
createEmbedding: (text: string) => Promise<Embeddings>
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
