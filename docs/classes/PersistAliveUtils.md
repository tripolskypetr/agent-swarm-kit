---
title: docs/api-reference/class/PersistAliveUtils
group: docs
---

# PersistAliveUtils

Implements `IPersistAliveControl`

Utility class for managing alive status persistence per client (`SessionId`) in the swarm system.
Provides methods to mark clients as online/offline and check their status within a `SwarmName`, with a customizable adapter.

## Constructor

```ts
constructor();
```

## Properties

### PersistAliveFactory

```ts
PersistAliveFactory: any
```

### getAliveStorage

```ts
getAliveStorage: any
```

Memoized function to create or retrieve storage for a specific client’s alive status.
Ensures a single persistence instance per client ID, optimizing resource use.

### markOnline

```ts
markOnline: (clientId: string, swarmName: string) => Promise<void>
```

Marks a client as online, persisting the status for future retrieval.
Used to track client availability in swarm operations.

### markOffline

```ts
markOffline: (clientId: string, swarmName: string) => Promise<void>
```

Marks a client as offline, persisting the status for future retrieval.
Used to track client availability in swarm operations.

### getOnline

```ts
getOnline: (clientId: string, swarmName: string) => Promise<boolean>
```

Retrieves the online status for a client, defaulting to `false` if unset.
Used to check client availability in swarm workflows.

## Methods

### usePersistAliveAdapter

```ts
usePersistAliveAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistAliveData>): void;
```

Configures a custom constructor for alive status persistence, overriding the default `PersistBase`.
Enables advanced tracking (e.g., in-memory or database-backed persistence).
