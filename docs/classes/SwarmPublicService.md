# SwarmPublicService

Implements `TSwarmConnectionService`

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

### waitForOutput

```ts
waitForOutput: (clientId: string, swarmName: string) => Promise<string>
```

### getAgentName

```ts
getAgentName: (clientId: string, swarmName: string) => Promise<string>
```

### getAgent

```ts
getAgent: (clientId: string, swarmName: string) => Promise<IAgent>
```

### setAgentName

```ts
setAgentName: (agentName: string, clientId: string, swarmName: string) => Promise<void>
```

### dispose

```ts
dispose: (clientId: string, swarmName: string) => Promise<void>
```
