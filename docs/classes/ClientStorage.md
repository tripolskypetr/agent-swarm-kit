# ClientStorage

Implements `IStorage<T>`

## Constructor

```ts
constructor(params: IStorageParams<T>);
```

## Properties

### params

```ts
params: IStorageParams<T>
```

### _itemMap

```ts
_itemMap: any
```

### _createEmbedding

```ts
_createEmbedding: ((item: T) => Promise<readonly [Embeddings, string]>) & IClearableMemoize<string | number> & IControlMemoize<string | number, Promise<readonly [Embeddings, string]>>
```

### waitForInit

```ts
waitForInit: (() => Promise<void>) & ISingleshotClearable
```

### take

```ts
take: (search: string, total: number) => Promise<T[]>
```

### upsert

```ts
upsert: (item: T) => Promise<void>
```

### remove

```ts
remove: (itemId: StorageId) => Promise<void>
```

### clear

```ts
clear: () => Promise<void>
```

### get

```ts
get: (itemId: StorageId) => Promise<T>
```

### list

```ts
list: (filter?: (item: T) => boolean) => Promise<T[]>
```
