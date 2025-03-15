# IPersistBase

Interface defining methods for persistent storage operations.

## Methods

### waitForInit

```ts
waitForInit: (initial: boolean) => Promise<void>
```

Initializes the storage, creating directories and validating existing data.

### readValue

```ts
readValue: (entityId: EntityId) => Promise<Entity>
```

Reads an entity from storage by its ID.

### hasValue

```ts
hasValue: (entityId: EntityId) => Promise<boolean>
```

Checks if an entity exists in storage.

### writeValue

```ts
writeValue: (entityId: EntityId, entity: Entity) => Promise<void>
```

Writes an entity to storage with the specified ID.
