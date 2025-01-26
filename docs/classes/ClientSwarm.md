# ClientSwarm

Implements `ISwarm`

## Constructor

```ts
constructor(params: ISwarmParams);
```

## Properties

### params

```ts
params: ISwarmParams
```

### _agentChangedSubject

```ts
_agentChangedSubject: any
```

### _activeAgent

```ts
_activeAgent: any
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

### setAgentRef

```ts
setAgentRef: (agentName: string, agent: IAgent) => Promise<void>
```

### setAgentName

```ts
setAgentName: (agentName: string) => Promise<void>
```
