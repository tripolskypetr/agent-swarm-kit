---
title: docs/api-reference/class/ClientSwarm
group: docs
---

# ClientSwarm

Implements `ISwarm`

Manages a collection of agents within a swarm in the swarm system, implementing the ISwarm interface.
Handles agent switching, output waiting, and navigation stack management, with queued operations and event-driven updates via BusService.
Integrates with SwarmConnectionService (swarm instantiation), ClientSession (agent execution/output), ClientAgent (agent instances),
SwarmSchemaService (swarm structure), and BusService (event emission).
Uses Subjects for agent change notifications and output cancellation, ensuring coordinated agent interactions.

## Constructor

```ts
constructor(params: ISwarmParams);
```

## Properties

### params

```ts
params: ISwarmParams
```

### _isBusy

```ts
_isBusy: any
```

### _agentChangedSubject

```ts
_agentChangedSubject: Subject<[agentName: string, agent: IAgent]>
```

Subject that emits when an agent reference changes, providing the agent name and instance.
Used by setAgentRef to notify subscribers (e.g., waitForOutput) of updates to agent instances.

### _activeAgent

```ts
_activeAgent: string | unique symbol
```

The name of the currently active agent, or a symbol indicating it needs to be fetched.
Initialized as AGENT_NEED_FETCH, lazily populated by getAgentName via params.getActiveAgent.
Updated by setAgentName, persisted via params.setActiveAgent.

### _navigationStack

```ts
_navigationStack: string[] | unique symbol
```

The navigation stack of agent names, or a symbol indicating it needs to be fetched.
Initialized as STACK_NEED_FETCH, lazily populated by navigationPop via params.getNavigationStack.
Updated by setAgentName (push) and navigationPop (pop), persisted via params.setNavigationStack.

### _emitSubject

```ts
_emitSubject: Subject<{ agentName: string; output: string; }>
```

Subject for emitting output messages to subscribers, used by emit and connect methods.
Provides an asynchronous stream of validated messages, supporting real-time updates to external connectors.

### _cancelOutputSubject

```ts
_cancelOutputSubject: Subject<{ agentName: string; output: string; }>
```

Subject that emits to cancel output waiting, providing an empty output string and agent name.
Triggered by cancelOutput to interrupt waitForOutput, ensuring responsive cancellation.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for output from the active agent in a queued manner, delegating to WAIT_FOR_OUTPUT_FN.
Ensures only one wait operation runs at a time, handling cancellation and agent changes, supporting ClientSession's output retrieval.

## Methods

### getCheckBusy

```ts
getCheckBusy(): Promise<boolean>;
```

Returns the current busy state of the swarm.
Used to check if the swarm is currently processing an operation (e.g., waiting for output or switching agents).
Supports debugging and flow control in client applications.

### setBusy

```ts
setBusy(isBusy: boolean): void;
```

Sets the busy state of the swarm.
Used internally to indicate when the swarm is processing an operation, such as waiting for output.
Enables coordinated state management and debugging.

### getBusy

```ts
getBusy(): boolean;
```

Getter for the busy state of the swarm.
Used internally for optimizing performance and flow control.
Returns true if the swarm is currently busy with an operation, false otherwise.
Supports debugging and flow control in client applications.

### emit

```ts
emit(message: string): Promise<void>;
```

Emits a message to subscribers via _emitSubject after validating it against the policy (ClientPolicy).
Emits the ban message if validation fails, notifying subscribers and logging via BusService.
Supports SwarmConnectionService by broadcasting session outputs within the swarm.

### navigationPop

```ts
navigationPop(): Promise<string>;
```

Pops the most recent agent from the navigation stack, falling back to the default agent if empty.
Updates and persists the stack via params.setNavigationStack, supporting ClientSession's agent navigation.

### cancelOutput

```ts
cancelOutput(): Promise<void>;
```

Cancels the current output wait by emitting an empty string via _cancelOutputSubject, logging via BusService.
Interrupts waitForOutput, ensuring responsive cancellation for ClientSession's execution flow.

### getAgentName

```ts
getAgentName(): Promise<AgentName>;
```

Retrieves the name of the active agent, lazily fetching it via params.getActiveAgent if not loaded.
Emits an event via BusService with the result, supporting ClientSession's agent identification.

### getAgent

```ts
getAgent(): Promise<IAgent>;
```

Retrieves the active agent instance (ClientAgent) based on its name from params.agentMap.
Emits an event via BusService with the result, supporting ClientSession's execution and history operations.

### setAgentRef

```ts
setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
```

Updates the reference to an agent in the swarm's agent map (params.agentMap), notifying subscribers via _agentChangedSubject.
Emits an event via BusService, supporting dynamic agent updates within ClientSession's execution flow.

### setAgentName

```ts
setAgentName(agentName: AgentName): Promise<void>;
```

Sets the active agent by name, updates the navigation stack, and persists the change via params.setActiveAgent/setNavigationStack.
Invokes the onAgentChanged callback and emits an event via BusService, supporting ClientSession's agent switching.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the swarm, performing cleanup
Called when the swarm is no longer needed, ensuring proper resource release.
