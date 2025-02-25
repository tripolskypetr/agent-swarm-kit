# SwarmConnectionService

Implements `ISwarm`

Service for managing swarm connections.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### busService

```ts
busService: any
```

### contextService

```ts
contextService: any
```

### agentConnectionService

```ts
agentConnectionService: any
```

### swarmSchemaService

```ts
swarmSchemaService: any
```

### getSwarm

```ts
getSwarm: ((clientId: string, swarmName: string) => ClientSwarm) & IClearableMemoize<string> & IControlMemoize<string, ClientSwarm>
```

Retrieves a swarm instance based on client ID and swarm name.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for the output from the swarm.

### getAgentName

```ts
getAgentName: () => Promise<string>
```

Retrieves the agent name from the swarm.

### getAgent

```ts
getAgent: () => Promise<IAgent>
```

Retrieves the agent from the swarm.

### setAgentRef

```ts
setAgentRef: (agentName: string, agent: IAgent) => Promise<void>
```

Sets the agent reference in the swarm.

### setAgentName

```ts
setAgentName: (agentName: string) => Promise<void>
```

Sets the agent name in the swarm.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the swarm connection.
