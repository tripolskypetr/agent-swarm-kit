# ISwarmSchema

Schema for defining a swarm.

## Properties

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
