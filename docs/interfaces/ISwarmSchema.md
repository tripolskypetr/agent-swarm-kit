# ISwarmSchema

Schema for defining a swarm.

## Properties

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

### onAgentChanged

```ts
onAgentChanged: (clientId: string, agentName: string, swarmName: string) => void
```

Emit the callback on agent change
