# IStorageSchema

Interface representing the schema of the storage.

## Properties

### persist

```ts
persist: boolean
```

Mark the storage to serialize values to the hard drive

### docDescription

```ts
docDescription: string
```

The description for documentation

### shared

```ts
shared: boolean
```

All agents will share the same ClientStorage instance

### getData

```ts
getData: (clientId: string, storageName: string, defaultValue: T[]) => T[] | Promise<T[]>
```

Function to get data from the storage.

### setData

```ts
setData: (data: T[], clientId: string, storageName: string) => void | Promise<void>
```

Function to set data from the storage to hard drive.

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

### getDefaultData

```ts
getDefaultData: (clientId: string, storageName: string) => T[] | Promise<T[]>
```

The default value. Resolved in `PersistStorage`

## Methods

### createIndex

```ts
createIndex: (item: T) => string | Promise<string>
```

Function to create an index for an item.
