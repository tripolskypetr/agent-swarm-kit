# IPersistBase

Interface defining methods for persistent storage operations.

## Methods

### waitForInit

```ts
waitForInit: (initial: boolean) => Promise<void>
```

Initializes the storage directory, creating it if needed and validating existing data by removing invalid entities.

### readValue

```ts
readValue: (entityId: EntityId) => Promise<Entity>
```

Reads an entity from storage by its ID.

### hasValue

```ts
hasValue: (entityId: EntityId) => Promise<boolean>
```

Checks if an entity exists in storage by its ID.

### writeValue

```ts
writeValue: (entityId: EntityId, entity: Entity) => Promise<void>
```

Writes an entity to storage with the specified ID.
