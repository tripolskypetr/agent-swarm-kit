# IBusEventContext

Interface representing the contextual metadata for an event in the swarm system.
Provides optional identifiers for components involved in an event (e.g., agent, swarm, storage), used partially in IBusEvent.context to supply additional context.
In ClientAgent, typically only agentName is populated (e.g., context: { agentName }), with other fields available for broader system use (e.g., swarm or policy events).

## Properties

### agentName

```ts
agentName: string
```

The unique name of the agent associated with the event.
Links the event to a specific agent instance (e.g., this.params.agentName in ClientAgent), consistently included in IBusEvent.context.
Example: "Agent1" for an agent emitting a "run" event.

### swarmName

```ts
swarmName: string
```

The unique name of the swarm associated with the event.
Identifies the swarm context, potentially used in swarm-wide events (e.g., IBus.emit in ISwarmParams), though not observed in ClientAgent.
Example: "SwarmA" for a swarm-level navigation event.

### storageName

```ts
storageName: string
```

The unique name of the storage associated with the event.
Ties the event to a specific storage instance (e.g., IStorage), potentially for storage-related events, unused in ClientAgent’s agent-centric emissions.
Example: "Storage1" for a storage upsert event.

### stateName

```ts
stateName: string
```

The unique name of the state associated with the event.
Links to a specific state instance (e.g., IState), potentially for state change events, not populated in ClientAgent’s context.
Example: "StateX" for a state update event.

### policyName

```ts
policyName: string
```

The unique name of the policy associated with the event.
Identifies the policy context (e.g., IPolicy), potentially for policy enforcement events (e.g., bans), unused in ClientAgent’s emissions.
Example: "PolicyY" for a client ban event.
