# PersistSwarmUtils

Implements `IPersistSwarmControl`

Utility class for managing swarm-related persistence

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

Memoized function to get storage for active agents

### getNavigationStackStorage

```ts
getNavigationStackStorage: any
```

Memoized function to get storage for navigation stacks

### getActiveAgent

```ts
getActiveAgent: (clientId: string, swarmName: string, defaultAgent: string) => Promise<string>
```

Gets the active agent for a client in a swarm

### setActiveAgent

```ts
setActiveAgent: (clientId: string, agentName: string, swarmName: string) => Promise<void>
```

Sets the active agent for a client in a swarm

### getNavigationStack

```ts
getNavigationStack: (clientId: string, swarmName: string) => Promise<string[]>
```

Gets the navigation stack for a client in a swarm

### setNavigationStack

```ts
setNavigationStack: (clientId: string, agentStack: string[], swarmName: string) => Promise<void>
```

Sets the navigation stack for a client in a swarm

## Methods

### usePersistActiveAgentAdapter

```ts
usePersistActiveAgentAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>): void;
```

Sets the factory for active agent persistence

### usePersistNavigationStackAdapter

```ts
usePersistNavigationStackAdapter(Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>): void;
```

Sets the factory for navigation stack persistence
