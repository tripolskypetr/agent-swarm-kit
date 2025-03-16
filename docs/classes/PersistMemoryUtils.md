# PersistMemoryUtils

Implements `IPersistMemoryControl`

Utility class for managing memory persistence per client.
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
Ensures a single instance per client ID.

### setMemory

```ts
setMemory: <T = unknown>(data: T, clientId: string) => Promise<void>
```

Sets the memory data for a client.
Persists the data wrapped in an IPersistMemoryData structure.

### getMemory

```ts
getMemory: <T = unknown>(clientId: string, defaultState: T) => Promise<T>
```

Retrieves the memory data for a client, falling back to a default if not set.

## Methods

### usePersistMemoryAdapter

```ts
usePersistMemoryAdapter(Ctor: TPersistBaseCtor<SessionId, IPersistMemoryData>): void;
```

Sets a custom constructor for memory persistence, overriding the default PersistBase.

### dispose

```ts
dispose(clientId: string): Promise<void>;
```

Disposes of the memory storage for a client by clearing its memoized instance.
