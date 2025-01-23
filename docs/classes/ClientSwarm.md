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

### setAgentName

```ts
setAgentName: (agentName: string) => Promise<void>
```
