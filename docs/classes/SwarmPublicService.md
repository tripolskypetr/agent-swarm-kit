# SwarmPublicService

Implements `TSwarmConnectionService`

Service for managing public swarm interactions.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### swarmConnectionService

```ts
swarmConnectionService: any
```

### cancelOutput

```ts
cancelOutput: (clientId: string, swarmName: string) => Promise<void>
```

Cancel the await of output by emit of empty string

### waitForOutput

```ts
waitForOutput: (clientId: string, swarmName: string) => Promise<string>
```

Waits for output from the swarm.

### getAgentName

```ts
getAgentName: (clientId: string, swarmName: string) => Promise<string>
```

Gets the agent name from the swarm.

### getAgent

```ts
getAgent: (clientId: string, swarmName: string) => Promise<IAgent>
```

Gets the agent from the swarm.

### setAgentRef

```ts
setAgentRef: (clientId: string, swarmName: string, agentName: string, agent: IAgent) => Promise<void>
```

Sets the agent reference in the swarm.

### setAgentName

```ts
setAgentName: (agentName: string, clientId: string, swarmName: string) => Promise<void>
```

Sets the agent name in the swarm.

### dispose

```ts
dispose: (clientId: string, swarmName: string) => Promise<void>
```

Disposes of the swarm.
