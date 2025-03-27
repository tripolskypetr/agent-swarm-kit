---
title: docs/api-reference/class/StorageUtils
group: docs
---

# StorageUtils

Implements `TStorage`

Utility class for managing client-specific storage within an agent swarm.
Provides methods to manipulate and query storage data for specific clients, agents, and storage names,
interfacing with the swarm's storage service and enforcing agent-storage registration.

## Constructor

```ts
constructor();
```

## Properties

### take

```ts
take: <T extends IStorageData = IStorageData>(payload: { search: string; total: number; clientId: string; agentName: string; storageName: string; score?: number; }) => Promise<T[]>
```

Retrieves a specified number of items from storage matching a search query for a given client and agent.
Validates the client session, storage name, and agent-storage registration before querying the storage service.
Executes within a context for logging.

### upsert

```ts
upsert: <T extends IStorageData = IStorageData>(payload: { item: T; clientId: string; agentName: string; storageName: string; }) => Promise<void>
```

Inserts or updates an item in the storage for a given client and agent.
Validates the client session, storage name, and agent-storage registration before updating via the storage service.
Executes within a context for logging.

### remove

```ts
remove: (payload: { itemId: StorageId; clientId: string; agentName: string; storageName: string; }) => Promise<void>
```

Removes an item from the storage by its ID for a given client and agent.
Validates the client session, storage name, and agent-storage registration before removing via the storage service.
Executes within a context for logging.

### get

```ts
get: <T extends IStorageData = IStorageData>(payload: { itemId: StorageId; clientId: string; agentName: string; storageName: string; }) => Promise<T>
```

Retrieves an item from the storage by its ID for a given client and agent.
Validates the storage name and agent-storage registration before querying the storage service.
Executes within a context for logging.

### list

```ts
list: <T extends IStorageData = IStorageData>(payload: { clientId: string; agentName: string; storageName: string; filter?: (item: T) => boolean; }) => Promise<T[]>
```

Lists all items in the storage for a given client and agent, optionally filtered by a predicate.
Validates the storage name and agent-storage registration before querying the storage service.
Executes within a context for logging.

### createNumericIndex

```ts
createNumericIndex: (payload: { clientId: string; agentName: string; storageName: string; }) => Promise<number>
```

Creates a numeric index for the storage of a given client and agent.
Validates the storage name and agent-storage registration before calculating the index.
Executes within a context for logging.
The numeric index is determined based on the current number of items in the storage.

### clear

```ts
clear: (payload: { clientId: string; agentName: string; storageName: string; }) => Promise<void>
```

Clears all items from the storage for a given client and agent.
Validates the storage name and agent-storage registration before clearing via the storage service.
Executes within a context for logging.
