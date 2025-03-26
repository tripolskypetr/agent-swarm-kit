---
title: docs/api-reference/class/PersistSwarmUtils
group: docs
---

# PersistSwarmUtils

Implements `IPersistSwarmControl`

Utility class for managing swarm-related persistence, including active agents and navigation stacks.
Provides methods to get/set active agents and navigation stacks per client (`SessionId`) and swarm (`SwarmName`), with customizable adapters.

## Constructor

```ts
constructor();
```

## Properties

### PersistActiveAgentFactory

```ts
PersistActiveAgentFactory: any
```

### PersistNavigationStackFactory

```ts
PersistNavigationStackFactory: any
```

### getActiveAgentStorage

```ts
getActiveAgentStorage: any
```

Memoized function to create or retrieve storage for active agents.
Ensures a single persistence instance per `SwarmName`, improving efficiency.

### getNavigationStackStorage

```ts
getNavigationStackStorage: any
```

Memoized function to create or retrieve storage for navigation stacks.
Ensures a single persistence instance per `SwarmName`, optimizing resource use.

### getActiveAgent

```ts
getActiveAgent: (clientId: string, swarmName: string, defaultAgent: string) => Promise<string>
```

Retrieves the active agent for a client within a swarm, falling back to a default if not set.
Used to determine the current `AgentName` for a `SessionId` in a `SwarmName` context.

### setActiveAgent

```ts
setActiveAgent: (clientId: string, agentName: string, swarmName: string) => Promise<void>
```

Sets the active agent for a client within a swarm, persisting it for future retrieval.
Links a `SessionId` to an `AgentName` within a `SwarmName` for runtime agent switching.

### getNavigationStack

```ts
getNavigationStack: (clientId: string, swarmName: string) => Promise<string[]>
```

Retrieves the navigation stack for a client within a swarm, returning an empty array if unset.
Tracks navigation history as a stack of `AgentName`s for a `SessionId` within a `SwarmName`.

### setNavigationStack

```ts
setNavigationStack: (clientId: string, agentStack: string[], swarmName: string) => Promise<void>
```

Sets the navigation stack for a client within a swarm, persisting it for future retrieval.
Stores a stack of `AgentName`s for a `SessionId` within a `SwarmName` to track navigation history.

## Methods

### usePersistActiveAgentAdapter

```ts
usePersistActiveAgentAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>): void;
```

Configures a custom constructor for active agent persistence, overriding the default `PersistBase`.
Allows advanced use cases like in-memory storage for `SwarmName`-specific active agents.

### usePersistNavigationStackAdapter

```ts
usePersistNavigationStackAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>): void;
```

Configures a custom constructor for navigation stack persistence, overriding the default `PersistBase`.
Enables customization for navigation tracking within a `SwarmName` (e.g., alternative storage backends).
