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
_agentChangedSubject: Subject<[agentName: string, agent: IAgent]>
```

### _activeAgent

```ts
_activeAgent: string | unique symbol
```

### _navigationStack

```ts
_navigationStack: string[] | unique symbol
```

### _cancelOutputSubject

```ts
_cancelOutputSubject: Subject<{ agentName: string; output: string; }>
```

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for output from the active agent.

## Methods

### navigationPop

```ts
navigationPop(): Promise<string>;
```

Pop the navigation stack or return default agent

### cancelOutput

```ts
cancelOutput(): Promise<void>;
```

Cancel the await of output by emit of empty string

### getAgentName

```ts
getAgentName(): Promise<AgentName>;
```

Gets the name of the active agent.

### getAgent

```ts
getAgent(): Promise<IAgent>;
```

Gets the active agent.

### setAgentRef

```ts
setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
```

Sets the reference of an agent in the swarm.

### setAgentName

```ts
setAgentName(agentName: AgentName): Promise<void>;
```

Sets the active agent by name.
