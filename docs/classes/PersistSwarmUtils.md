# PersistSwarmUtils

Utility class for managing swarm-related persistence

## Constructor

```ts
constructor();
```

## Properties

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
