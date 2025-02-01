# ISwarmParams

Parameters for initializing a swarm.

## Properties

### clientId

```ts
clientId: string
```

Client identifier

### logger

```ts
logger: ILogger
```

Logger instance

### agentMap

```ts
agentMap: Record<string, IAgent>
```

Map of agent names to agent instances

### onAgentChanged

```ts
onAgentChanged: (clientId: string, agentName: string, swarmName: string) => Promise<void>
```

Emit the callback on agent change
