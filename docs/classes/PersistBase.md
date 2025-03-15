# PersistBase

Implements `IPersistBase`

Base class for persistent storage of entities in the file system.

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

### __@BASE_WAIT_FOR_INIT_SYMBOL@482

```ts
__@BASE_WAIT_FOR_INIT_SYMBOL@482: any
```

Memoized initialization function to ensure it runs only once.

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

Initializes the storage directory and validates existing entities.
Creates the directory if it doesn't exist and removes invalid files.

### getCount

```ts
getCount(): Promise<number>;
```

Retrieves the number of entities stored in the directory.

### readValue

```ts
readValue<T extends IEntity = IEntity>(entityId: EntityId): Promise<T>;
```

Reads an entity from storage by its ID.

### hasValue

```ts
hasValue(entityId: EntityId): Promise<boolean>;
```

Checks if an entity exists in storage by its ID.

### writeValue

```ts
writeValue<T extends IEntity = IEntity>(entityId: EntityId, entity: T): Promise<void>;
```

Writes an entity to storage with the specified ID.

### removeValue

```ts
removeValue(entityId: EntityId): Promise<void>;
```

Removes an entity from storage by its ID.

### removeAll

```ts
removeAll(): Promise<void>;
```

Removes all entities from storage.

### values

```ts
values<T extends IEntity = IEntity>(): AsyncGenerator<T>;
```

Iterates over all entities in storage, sorted numerically by ID.

### keys

```ts
keys(): AsyncGenerator<EntityId>;
```

Iterates over all entity IDs in storage, sorted numerically.

### __@asyncIterator@483

```ts
[Symbol.asyncIterator](): AsyncIterableIterator<any>;
```

Implements the async iterator protocol for iterating over entities.

### filter

```ts
filter<T extends IEntity = IEntity>(predicate: (value: T) => boolean): AsyncGenerator<T>;
```

Filters entities based on a predicate function.

### take

```ts
take<T extends IEntity = IEntity>(total: number, predicate?: (value: T) => boolean): AsyncGenerator<T>;
```

Takes a limited number of entities, optionally filtered by a predicate.
