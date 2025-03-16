# PersistSwarmUtils

Implements `IPersistSwarmControl`

Utility class for managing swarm-related persistence, including active agents and navigation stacks.
Provides methods to get/set active agents and navigation stacks per client and swarm.

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
Ensures a single instance per swarm name.

### getNavigationStackStorage

```ts
getNavigationStackStorage: any
```

Memoized function to create or retrieve storage for navigation stacks.
Ensures a single instance per swarm name.

### getActiveAgent

```ts
getActiveAgent: (clientId: string, swarmName: string, defaultAgent: string) => Promise<string>
```

Retrieves the active agent for a client within a swarm, falling back to a default if not set.

### setActiveAgent

```ts
setActiveAgent: (clientId: string, agentName: string, swarmName: string) => Promise<void>
```

Sets the active agent for a client within a swarm.

### getNavigationStack

```ts
getNavigationStack: (clientId: string, swarmName: string) => Promise<string[]>
```

Retrieves the navigation stack for a client within a swarm.
Returns an empty array if no stack is set.

### setNavigationStack

```ts
setNavigationStack: (clientId: string, agentStack: string[], swarmName: string) => Promise<void>
```

Sets the navigation stack for a client within a swarm.

## Methods

### usePersistActiveAgentAdapter

```ts
usePersistActiveAgentAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>): void;
```

Sets a custom constructor for active agent persistence, overriding the default PersistBase.

### usePersistNavigationStackAdapter

```ts
usePersistNavigationStackAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>): void;
```

Sets a custom constructor for navigation stack persistence, overriding the default PersistBase.
