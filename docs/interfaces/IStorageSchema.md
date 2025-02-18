# IStorageSchema

## Properties

### getData

```ts
getData: (clientId: string, storageName: string) => T[] | Promise<T[]>
```

### embedding

```ts
embedding: string
```

### storageName

```ts
storageName: string
```

### callbacks

```ts
callbacks: Partial<IStorageCallbacks<T>>
```

## Methods

### createIndex

```ts
createIndex: (item: T) => Promise<string>
```
