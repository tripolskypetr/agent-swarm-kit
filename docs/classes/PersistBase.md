# PersistBase

Implements `IPersistBase`

Base class for persistent storage of entities in a file system

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

The directory path where entity files are stored

### __@BASE_WAIT_FOR_INIT_SYMBOL@482

```ts
__@BASE_WAIT_FOR_INIT_SYMBOL@482: any
```

Initializes the storage directory

## Methods

### _getFilePath

```ts
_getFilePath(entityId: EntityId): string;
```

Gets the file path for an entity

### waitForInit

```ts
waitForInit(initial: boolean): Promise<void>;
```

Waits for initialization to complete

### getCount

```ts
getCount(): Promise<number>;
```

Gets the count of entities in the storage

### readValue

```ts
readValue<T extends IEntity = IEntity>(entityId: EntityId): Promise<T>;
```

Reads an entity from storage

### hasValue

```ts
hasValue(entityId: EntityId): Promise<boolean>;
```

Checks if an entity exists in storage

### writeValue

```ts
writeValue<T extends IEntity = IEntity>(entityId: EntityId, entity: T): Promise<void>;
```

Writes an entity to storage

### removeValue

```ts
removeValue(entityId: EntityId): Promise<void>;
```

Removes an entity from storage

### removeAll

```ts
removeAll(): Promise<void>;
```

Removes all entities from storage

### values

```ts
values<T extends IEntity = IEntity>(): AsyncGenerator<T>;
```

Iterates over all entities in storage

### keys

```ts
keys(): AsyncGenerator<EntityId>;
```

Iterates over all entity IDs in storage

### __@asyncIterator@483

```ts
[Symbol.asyncIterator](): AsyncIterableIterator<any>;
```

Implements the Symbol.asyncIterator protocol

### filter

```ts
filter<T extends IEntity = IEntity>(predicate: (value: T) => boolean): AsyncGenerator<T>;
```

Filters entities based on a predicate

### take

```ts
take<T extends IEntity = IEntity>(total: number, predicate?: (value: T) => boolean): AsyncGenerator<T>;
```

Takes a limited number of entities, optionally filtered
