---
title: docs/api-reference/class/PersistPolicyUtils
group: docs
---

# PersistPolicyUtils

Implements `IPersistPolicyControl`

Utility class for managing policy data persistence in the swarm system.
Provides methods to get and set banned clients within a `SwarmName`, with a customizable adapter.

## Constructor

```ts
constructor();
```

## Properties

### PersistPolicyFactory

```ts
PersistPolicyFactory: any
```

### getPolicyStorage

```ts
getPolicyStorage: any
```

Memoized function to create or retrieve storage for a specific policy data.
Ensures a single persistence instance per swarm, optimizing resource use.

### getBannedClients

```ts
getBannedClients: (policyName: string, swarmName: string, defaultValue?: string[]) => Promise<string[]>
```

Retrieves the list of banned clients for a specific policy, defaulting to an empty array if unset.
Used to check client ban status in swarm workflows.

### setBannedClients

```ts
setBannedClients: (bannedClients: string[], policyName: string, swarmName: string) => Promise<void>
```

Sets the list of banned clients for a specific policy, persisting the status for future retrieval.
Used to manage client bans in swarm operations.

## Methods

### usePersistPolicyAdapter

```ts
usePersistPolicyAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistPolicyData>): void;
```

Configures a custom constructor for policy data persistence, overriding the default `PersistBase`.
Enables advanced tracking (e.g., in-memory or database-backed persistence).
