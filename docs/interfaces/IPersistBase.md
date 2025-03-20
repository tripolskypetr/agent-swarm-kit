# IPersistBase

Defines the core interface for persistent storage operations in the swarm system.
Provides methods for managing entities stored as JSON files in the file system, used across swarm utilities.

## Methods

### waitForInit

```ts
waitForInit: (initial: boolean) => Promise<void>
```

Initializes the storage directory, creating it if needed and validating existing data by removing invalid entities.
Ensures the persistence layer is ready for use, handling corrupt files during setup.

### readValue

```ts
readValue: (entityId: EntityId) => Promise<Entity>
```

Reads an entity from persistent storage by its ID, parsing it from a JSON file.
Used to retrieve persisted data such as agent states, memory, or alive status.

### hasValue

```ts
hasValue: (entityId: EntityId) => Promise<boolean>
```

Checks if an entity exists in persistent storage by its ID.
Useful for conditional operations without reading the full entity (e.g., checking session memory existence).

### writeValue

```ts
writeValue: (entityId: EntityId, entity: Entity) => Promise<void>
```

Writes an entity to persistent storage with the specified ID, serializing it to JSON.
Uses atomic writes to ensure data integrity, critical for reliable state persistence across swarm operations.
