# SwarmConnectionService

Implements `ISwarm`

Service class for managing swarm connections and operations in the swarm system.
Implements ISwarm to provide an interface for swarm instance management, agent navigation, output handling, and lifecycle operations, scoped to clientId and swarmName.
Integrates with ClientAgent (agent execution within swarms), SwarmPublicService (public swarm API), AgentConnectionService (agent management), SessionConnectionService (session-swarm linking), and PerfService (tracking via BusService).
Uses memoization via functools-kit’s memoize to cache ClientSwarm instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with SwarmSchemaService for swarm configuration and AgentConnectionService for agent instantiation, applying persistence via PersistSwarmAdapter or defaults from GLOBAL_CONFIG.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging swarm operations.
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SwarmPublicService and PerfService logging patterns.

### busService

```ts
busService: any
```

Bus service instance, injected via DI, for emitting swarm-related events.
Passed to ClientSwarm for event propagation (e.g., agent changes), aligning with BusService’s event system in AgentConnectionService.

### methodContextService

```ts
methodContextService: any
```

Method context service instance, injected via DI, for accessing execution context.
Used to retrieve clientId and swarmName in method calls, integrating with MethodContextService’s scoping in SwarmPublicService.

### agentConnectionService

```ts
agentConnectionService: any
```

Agent connection service instance, injected via DI, for managing agent instances.
Provides agent instances to ClientSwarm in getSwarm, supporting AgentPublicService and ClientAgent integration.

### swarmSchemaService

```ts
swarmSchemaService: any
```

Swarm schema service instance, injected via DI, for retrieving swarm configurations.
Provides configuration (e.g., agentList, defaultAgent) to ClientSwarm in getSwarm, aligning with SwarmMetaService’s schema management.

### getSwarm

```ts
getSwarm: ((clientId: string, swarmName: string) => ClientSwarm) & IClearableMemoize<string> & IControlMemoize<string, ClientSwarm>
```

Retrieves or creates a memoized ClientSwarm instance for a given client and swarm name.
Uses functools-kit’s memoize to cache instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
Configures the swarm with schema data from SwarmSchemaService, agent instances from AgentConnectionService, and persistence via PersistSwarmAdapter or defaults from GLOBAL_CONFIG.
Supports ClientAgent (agent execution within swarms), SessionConnectionService (swarm access in sessions), and SwarmPublicService (public API).

### navigationPop

```ts
navigationPop: () => Promise<string>
```

Pops the navigation stack or returns the default agent if the stack is empty.
Delegates to ClientSwarm.navigationPop, using context from MethodContextService to identify the swarm, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SwarmPublicService’s navigationPop, supporting ClientAgent’s navigation within swarms.

### cancelOutput

```ts
cancelOutput: () => Promise<void>
```

Cancels the pending output by emitting an empty string, interrupting waitForOutput.
Delegates to ClientSwarm.cancelOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SwarmPublicService’s cancelOutput, supporting ClientAgent’s output control.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for and retrieves the output from the swarm’s active agent.
Delegates to ClientSwarm.waitForOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SwarmPublicService’s waitForOutput, supporting ClientAgent’s output retrieval, typically a string from agent execution.

### getAgentName

```ts
getAgentName: () => Promise<string>
```

Retrieves the name of the currently active agent in the swarm.
Delegates to ClientSwarm.getAgentName, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SwarmPublicService’s getAgentName, supporting ClientAgent’s agent tracking.

### getAgent

```ts
getAgent: () => Promise<IAgent>
```

Retrieves the currently active agent instance from the swarm.
Delegates to ClientSwarm.getAgent, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SwarmPublicService’s getAgent, supporting ClientAgent’s agent access.

### setAgentRef

```ts
setAgentRef: (agentName: string, agent: IAgent) => Promise<void>
```

Sets an agent reference in the swarm’s agent map, typically for dynamic agent addition.
Delegates to ClientSwarm.setAgentRef, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SwarmPublicService’s setAgentRef, supporting ClientAgent’s agent management.

### setAgentName

```ts
setAgentName: (agentName: string) => Promise<void>
```

Sets the active agent in the swarm by name, updating the navigation state.
Delegates to ClientSwarm.setAgentName, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SwarmPublicService’s setAgentName, supporting ClientAgent’s navigation control.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the swarm connection, clearing the memoized instance.
Checks if the swarm exists in the memoization cache before clearing it, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Aligns with SwarmPublicService’s dispose and PerfService’s cleanup, but does not call ClientSwarm.dispose (assuming cleanup is handled internally or unnecessary).
