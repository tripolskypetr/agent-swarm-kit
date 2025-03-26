---
title: docs/api-reference/interface/IStorageSchema
group: docs
---

# IStorageSchema

Interface representing the schema for storage configuration.
Defines how storage behaves, including persistence, indexing, and data access.

## Properties

### persist

```ts
persist: boolean
```

Optional flag to enable serialization of storage data to persistent storage (e.g., hard drive).

### docDescription

```ts
docDescription: string
```

Optional description for documentation purposes, aiding in storage usage understanding.

### shared

```ts
shared: boolean
```

Optional flag indicating whether the storage instance is shared across all agents for a client.

### getData

```ts
getData: (clientId: string, storageName: string, defaultValue: T[]) => T[] | Promise<T[]>
```

Optional function to retrieve data from the storage, overriding default behavior.

### setData

```ts
setData: (data: T[], clientId: string, storageName: string) => void | Promise<void>
```

Optional function to persist storage data to the hard drive, overriding default behavior.

### embedding

```ts
embedding: string
```

The name of the embedding mechanism used for indexing and searching storage data.

### storageName

```ts
storageName: string
```

The unique name of the storage within the swarm.

### callbacks

```ts
callbacks: Partial<IStorageCallbacks<T>>
```

Optional partial set of lifecycle callbacks for storage events, allowing customization.

### getDefaultData

```ts
getDefaultData: (clientId: string, storageName: string) => T[] | Promise<T[]>
```

Optional function to provide the default data for the storage, resolved in persistence logic.

## Methods

### createIndex

```ts
createIndex: (item: T) => string | Promise<string>
```

Function to generate an index for a storage item, used for search and retrieval.
