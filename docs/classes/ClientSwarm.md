# ClientSwarm

Implements `ISwarm`

Manages a collection of agents within a swarm, handling agent switching, output waiting, and navigation.

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

Subject that emits when an agent reference changes, providing the agent name and instance.

### _activeAgent

```ts
_activeAgent: string | unique symbol
```

The name of the currently active agent, or a symbol indicating it needs to be fetched.

### _navigationStack

```ts
_navigationStack: string[] | unique symbol
```

The navigation stack of agent names, or a symbol indicating it needs to be fetched.

### _cancelOutputSubject

```ts
_cancelOutputSubject: Subject<{ agentName: string; output: string; }>
```

Subject that emits to cancel output waiting, providing an empty output string.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for output from the active agent in a queued manner.
Handles cancellation and agent changes, ensuring only one wait operation at a time.

## Methods

### navigationPop

```ts
navigationPop(): Promise<string>;
```

Pops the most recent agent from the navigation stack or returns the default agent if empty.
Updates the persisted navigation stack.

### cancelOutput

```ts
cancelOutput(): Promise<void>;
```

Cancels the current output wait by emitting an empty string via the cancel subject.

### getAgentName

```ts
getAgentName(): Promise<AgentName>;
```

Retrieves the name of the active agent, fetching it if not yet loaded.
Emits an event with the result.

### getAgent

```ts
getAgent(): Promise<IAgent>;
```

Retrieves the active agent instance based on its name.
Emits an event with the result.

### setAgentRef

```ts
setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
```

Updates the reference to an agent in the swarm's agent map.
Notifies subscribers via the agent changed subject.

### setAgentName

```ts
setAgentName(agentName: AgentName): Promise<void>;
```

Sets the active agent by name, updates the navigation stack, and persists the change.
Invokes the onAgentChanged callback if provided.
