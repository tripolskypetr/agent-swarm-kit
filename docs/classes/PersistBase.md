---
title: docs/api-reference/class/PersistBase
group: docs
---

# PersistBase

Implements `IPersistBase`

Base class for persistent storage of entities in the swarm system, using the file system.
Provides foundational methods for reading, writing, and managing entities as JSON files, supporting swarm utilities like `PersistAliveUtils`.

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

### __@BASE_WAIT_FOR_INIT_SYMBOL@576

```ts
__@BASE_WAIT_FOR_INIT_SYMBOL@576: (() => Promise<void>) & ISingleshotClearable
```

Memoized initialization function ensuring it runs only once per instance.
Uses `singleshot` to prevent redundant initialization calls, critical for swarm setup efficiency.

## Methods

### _getFilePath

```ts
_getFilePath(entityId: EntityId): string;
```

Computes the full file path for an entity based on its ID.

### waitForInit

```ts
waitForInit(initial: boolean): Promise<void>;
```

Initializes the storage directory, creating it if it doesn’t exist, and validates existing entities.
Removes invalid JSON files during initialization to ensure data integrity (e.g., for `SwarmName`-based alive status).

### getCount

```ts
getCount(): Promise<number>;
```

Retrieves the number of entities stored in the directory.
Counts only files with a `.json` extension, useful for monitoring storage usage (e.g., active sessions).

### readValue

```ts
readValue<T extends IEntity = IEntity>(entityId: EntityId): Promise<T>;
```

Reads an entity from storage by its ID, parsing it from a JSON file.
Core method for retrieving persisted data (e.g., alive status for a `SessionId` in a `SwarmName` context).

### hasValue

```ts
hasValue(entityId: EntityId): Promise<boolean>;
```

Checks if an entity exists in storage by its ID.
Efficiently verifies presence without reading the full entity (e.g., checking if a `SessionId` has memory).

### writeValue

```ts
writeValue<T extends IEntity = IEntity>(entityId: EntityId, entity: T): Promise<void>;
```

Writes an entity to storage with the specified ID, serializing it to JSON.
Uses atomic file writing via `writeFileAtomic` to ensure data integrity (e.g., persisting `AgentName` for a `SwarmName`).

### removeValue

```ts
removeValue(entityId: EntityId): Promise<void>;
```

Removes an entity from storage by its ID.
Deletes the corresponding JSON file, used for cleanup (e.g., removing a `SessionId`’s memory).

### removeAll

```ts
removeAll(): Promise<void>;
```

Removes all entities from storage under this entity name.
Deletes all `.json` files in the directory, useful for resetting persistence (e.g., clearing a `SwarmName`’s data).

### values

```ts
values<T extends IEntity = IEntity>(): AsyncGenerator<T>;
```

Iterates over all entities in storage, sorted numerically by ID.
Yields entities in ascending order, useful for batch processing (e.g., listing all `SessionId`s in a `SwarmName`).

### keys

```ts
keys(): AsyncGenerator<EntityId>;
```

Iterates over all entity IDs in storage, sorted numerically.
Yields IDs in ascending order, useful for key enumeration (e.g., listing `SessionId`s in a `SwarmName`).

### __@asyncIterator@577

```ts
[Symbol.asyncIterator](): AsyncIterableIterator<any>;
```

Implements the async iterator protocol for iterating over entities.
Delegates to the `values` method for iteration, enabling `for await` loops over entities.

### filter

```ts
filter<T extends IEntity = IEntity>(predicate: (value: T) => boolean): AsyncGenerator<T>;
```

Filters entities based on a predicate function, yielding only matching entities.
Useful for selective retrieval (e.g., finding online `SessionId`s in a `SwarmName`).

### take

```ts
take<T extends IEntity = IEntity>(total: number, predicate?: (value: T) => boolean): AsyncGenerator<T>;
```

Takes a limited number of entities, optionally filtered by a predicate.
Stops yielding after reaching the specified total, useful for pagination (e.g., sampling `SessionId`s).
