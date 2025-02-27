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
cancelOutput: (methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Cancel the await of output by emit of empty string

### waitForOutput

```ts
waitForOutput: (methodName: string, clientId: string, swarmName: string) => Promise<string>
```

Waits for output from the swarm.

### getAgentName

```ts
getAgentName: (methodName: string, clientId: string, swarmName: string) => Promise<string>
```

Gets the agent name from the swarm.

### getAgent

```ts
getAgent: (methodName: string, clientId: string, swarmName: string) => Promise<IAgent>
```

Gets the agent from the swarm.

### setAgentRef

```ts
setAgentRef: (methodName: string, clientId: string, swarmName: string, agentName: string, agent: IAgent) => Promise<void>
```

Sets the agent reference in the swarm.

### setAgentName

```ts
setAgentName: (agentName: string, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Sets the agent name in the swarm.

### dispose

```ts
dispose: (methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Disposes of the swarm.
