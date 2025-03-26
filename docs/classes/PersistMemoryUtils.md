---
title: docs/api-reference/class/PersistMemoryUtils
group: docs
---

# PersistMemoryUtils

Implements `IPersistMemoryControl`

Utility class for managing memory persistence per client (`SessionId`) in the swarm system.
Provides methods to get/set memory data with a customizable persistence adapter.

## Constructor

```ts
constructor();
```

## Properties

### PersistMemoryFactory

```ts
PersistMemoryFactory: any
```

### getMemoryStorage

```ts
getMemoryStorage: any
```

Memoized function to create or retrieve storage for a specific client’s memory.
Ensures a single persistence instance per `SessionId`, optimizing resource use.

### setMemory

```ts
setMemory: <T = unknown>(data: T, clientId: string) => Promise<void>
```

Sets the memory data for a client, persisting it for future retrieval.
Stores session-specific memory for a `SessionId` (e.g., temporary context).

### getMemory

```ts
getMemory: <T = unknown>(clientId: string, defaultState: T) => Promise<T>
```

Retrieves the memory data for a client, falling back to a default if unset.
Restores session-specific memory for a `SessionId` (e.g., resuming context).

### dispose

```ts
dispose: (clientId: string) => void
```

Disposes of the memory storage for a client by clearing its memoized instance.
Useful for cleanup when a `SessionId` ends or memory is no longer needed.

## Methods

### usePersistMemoryAdapter

```ts
usePersistMemoryAdapter(Ctor: TPersistBaseCtor<SessionId, IPersistMemoryData>): void;
```

Configures a custom constructor for memory persistence, overriding the default `PersistBase`.
Enables advanced memory storage for `SessionId` (e.g., in-memory or database-backed persistence).
