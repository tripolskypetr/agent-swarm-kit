# IStorageSchema

Interface representing the schema of the storage.

## Properties

### getData

```ts
getData: (clientId: string, storageName: string) => T[] | Promise<T[]>
```

Function to get data from the storage.

### embedding

```ts
embedding: string
```

The name of the embedding.

### storageName

```ts
storageName: string
```

The name of the storage.

### callbacks

```ts
callbacks: Partial<IStorageCallbacks<T>>
```

Optional callbacks for storage events.

## Methods

### createIndex

```ts
createIndex: (item: T) => string | Promise<string>
```

Function to create an index for an item.
