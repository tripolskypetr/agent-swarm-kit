# SwarmValidationService

Service for validating swarms and their agents.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### agentValidationService

```ts
agentValidationService: any
```

### _swarmMap

```ts
_swarmMap: any
```

### addSwarm

```ts
addSwarm: (swarmName: string, swarmSchema: ISwarmSchema) => void
```

Adds a new swarm to the swarm map.

### getAgentList

```ts
getAgentList: (swarmName: string) => string[]
```

Retrieves the list of agents for a given swarm.

### getSwarmList

```ts
getSwarmList: () => string[]
```

Retrieves the list of swarms

### validate

```ts
validate: (swarmName: string, source: string) => void
```

Validates a swarm and its agents.
