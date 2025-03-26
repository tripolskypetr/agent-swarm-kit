---
title: docs/api-reference/class/PersistBase
group: docs
---

# PersistBase

Implements `IPersistBase`

Base class for persistent storage of entities in the file system.
Provides methods for reading, writing, and managing entities as JSON files.

## Constructor

```ts
constructor(entityName: EntityName, baseDir: string);
```

## Properties

### entityName

```ts
entityName: EntityName
```

### baseDir

```ts
baseDir: string
```

### _directory

```ts
_directory: string
```

### __@BASE_WAIT_FOR_INIT_SYMBOL@481

```ts
__@BASE_WAIT_FOR_INIT_SYMBOL@481: any
```

Memoized initialization function ensuring it runs only once per instance.

## Methods

### _getFilePath

```ts
_getFilePath(entityId: EntityId): string;
```

Computes the file path for an entity based on its ID.

### waitForInit

```ts
waitForInit(initial: boolean): Promise<void>;
```

Initializes the storage directory, creating it if it doesn’t exist and validating existing entities.
Invalid entities are removed during this process.

### getCount

```ts
getCount(): Promise<number>;
```

Retrieves the number of entities stored in the directory.
Counts only files with a `.json` extension.

### readValue

```ts
readValue<T extends IEntity = IEntity>(entityId: EntityId): Promise<T>;
```

Reads an entity from storage by its ID, parsing it from JSON.

### hasValue

```ts
hasValue(entityId: EntityId): Promise<boolean>;
```

Checks if an entity exists in storage by its ID.

### writeValue

```ts
writeValue<T extends IEntity = IEntity>(entityId: EntityId, entity: T): Promise<void>;
```

Writes an entity to storage with the specified ID, serializing it to JSON.
Uses atomic file writing to ensure data integrity.

### removeValue

```ts
removeValue(entityId: EntityId): Promise<void>;
```

Removes an entity from storage by its ID.

### removeAll

```ts
removeAll(): Promise<void>;
```

Removes all entities from storage under this entity name.
Deletes all `.json` files in the directory.

### values

```ts
values<T extends IEntity = IEntity>(): AsyncGenerator<T>;
```

Iterates over all entities in storage, sorted numerically by ID.
Yields entities in ascending order based on their IDs.

### keys

```ts
keys(): AsyncGenerator<EntityId>;
```

Iterates over all entity IDs in storage, sorted numerically.
Yields IDs in ascending order.

### __@asyncIterator@482

```ts
[Symbol.asyncIterator](): AsyncIterableIterator<any>;
```

Implements the async iterator protocol for iterating over entities.
Delegates to the `values` method for iteration.

### filter

```ts
filter<T extends IEntity = IEntity>(predicate: (value: T) => boolean): AsyncGenerator<T>;
```

Filters entities based on a predicate function.
Yields only entities that pass the predicate test.

### take

```ts
take<T extends IEntity = IEntity>(total: number, predicate?: (value: T) => boolean): AsyncGenerator<T>;
```

Takes a limited number of entities, optionally filtered by a predicate.
Stops yielding after reaching the specified total.
