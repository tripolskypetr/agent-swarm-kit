# ISwarmSchema

Schema for defining a swarm.

## Properties

### persist

```ts
persist: boolean
```

Mark the swarm to serialize it navigation and active agent state to the hard drive

### docDescription

```ts
docDescription: string
```

The description for documentation

### policies

```ts
policies: string[]
```

The banhammer policies

### getNavigationStack

```ts
getNavigationStack: (clientId: string, swarmName: string) => string[] | Promise<string[]>
```

Get the current navigation stack after init

### setNavigationStack

```ts
setNavigationStack: (clientId: string, navigationStack: string[], swarmName: string) => Promise<void>
```

Upload the current navigation stack after change

### getActiveAgent

```ts
getActiveAgent: (clientId: string, swarmName: string, defaultAgent: string) => string | Promise<string>
```

Fetch the active agent on init

### setActiveAgent

```ts
setActiveAgent: (clientId: string, agentName: string, swarmName: string) => void | Promise<void>
```

Update the active agent after navigation

### defaultAgent

```ts
defaultAgent: string
```

Default agent name

### swarmName

```ts
swarmName: string
```

Name of the swarm

### agentList

```ts
agentList: string[]
```

List of agent names

### callbacks

```ts
callbacks: Partial<ISwarmCallbacks>
```

Lifecycle callbacks
