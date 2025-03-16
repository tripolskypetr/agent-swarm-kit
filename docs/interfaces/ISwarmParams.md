# ISwarmParams

Interface representing the parameters required to initialize a swarm.
Extends the swarm schema (excluding certain fields) with runtime dependencies.

## Properties

### clientId

```ts
clientId: string
```

The unique identifier of the client initializing the swarm.

### logger

```ts
logger: ILogger
```

The logger instance for recording swarm-related activity and errors.

### bus

```ts
bus: IBus
```

The bus instance for event communication within the swarm.

### agentMap

```ts
agentMap: Record<string, IAgent>
```

A map of agent names to their corresponding agent instances for runtime access.
