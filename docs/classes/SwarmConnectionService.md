# SwarmConnectionService

Implements `ISwarm`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
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

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

### getAgentName

```ts
getAgentName: () => Promise<string>
```

### getAgent

```ts
getAgent: () => Promise<IAgent>
```

### setAgentName

```ts
setAgentName: (agentName: string) => Promise<void>
```

### dispose

```ts
dispose: () => Promise<void>
```
