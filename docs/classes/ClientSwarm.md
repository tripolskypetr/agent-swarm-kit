# ClientSwarm

Implements `ISwarm`

ClientSwarm class implements the ISwarm interface and manages agents within a swarm.

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

Waits for output from the active agent.

### getAgentName

```ts
getAgentName: () => Promise<string>
```

Gets the name of the active agent.

### getAgent

```ts
getAgent: () => Promise<IAgent>
```

Gets the active agent.

### setAgentRef

```ts
setAgentRef: (agentName: string, agent: IAgent) => Promise<void>
```

Sets the reference of an agent in the swarm.

### setAgentName

```ts
setAgentName: (agentName: string) => Promise<void>
```

Sets the active agent by name.
