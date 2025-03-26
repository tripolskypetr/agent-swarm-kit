---
title: docs/api-reference/interface/ISwarmSchema
group: docs
---

# ISwarmSchema

Interface representing the schema for defining a swarm.
Configures the swarm's behavior, navigation, and agent management.

## Properties

### persist

```ts
persist: boolean
```

Optional flag to enable serialization of navigation stack and active agent state to persistent storage (e.g., hard drive).

### docDescription

```ts
docDescription: string
```

Optional description for documentation purposes, aiding in swarm usage understanding.

### policies

```ts
policies: string[]
```

Optional array of policy names defining banhammer or access control rules for the swarm.

### getNavigationStack

```ts
getNavigationStack: (clientId: string, swarmName: string) => string[] | Promise<string[]>
```

Optional function to retrieve the initial navigation stack after swarm initialization.

### setNavigationStack

```ts
setNavigationStack: (clientId: string, navigationStack: string[], swarmName: string) => Promise<void>
```

Optional function to persist the navigation stack after a change.

### getActiveAgent

```ts
getActiveAgent: (clientId: string, swarmName: string, defaultAgent: string) => string | Promise<string>
```

Optional function to fetch the active agent upon swarm initialization.

### setActiveAgent

```ts
setActiveAgent: (clientId: string, agentName: string, swarmName: string) => void | Promise<void>
```

Optional function to update the active agent after navigation changes.

### defaultAgent

```ts
defaultAgent: string
```

The default agent name to use when no active agent is specified.

### swarmName

```ts
swarmName: string
```

The unique name of the swarm within the system.

### agentList

```ts
agentList: string[]
```

The list of agent names available within the swarm.

### callbacks

```ts
callbacks: Partial<ISwarmCallbacks>
```

Optional partial set of lifecycle callbacks for the swarm, allowing customization of events.
