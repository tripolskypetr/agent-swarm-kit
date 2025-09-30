---
title: docs/api-reference/class/SwarmPublicService
group: docs
---

# SwarmPublicService

Implements `TSwarmConnectionService`

Service class for managing public swarm-level interactions in the swarm system.
Implements TSwarmConnectionService to provide a public API for swarm operations, delegating to SwarmConnectionService and wrapping calls with MethodContextService for context scoping.
Integrates with ClientAgent (e.g., agent execution in EXECUTE_FN), AgentPublicService (e.g., agent-specific operations), SwarmMetaService (e.g., swarm metadata via swarmName), SessionPublicService (e.g., swarm context), and PerfService (e.g., tracking swarm interactions in sessionState).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like navigation, output control, agent management, and swarm disposal, all scoped to a client (clientId) and swarm (swarmName).

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
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.

### swarmConnectionService

```ts
swarmConnectionService: any
```

Swarm connection service instance, injected via DI, for underlying swarm operations.
Provides core functionality (e.g., navigationPop, getAgent) called by public methods, supporting ClientAgent’s swarm-level needs.

### emit

```ts
emit: (content: string, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Emits a message to the session for a specific client and swarm.
Wraps SessionConnectionService.emit with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., session-level messaging) and AgentPublicService (e.g., swarm context emission).

### navigationPop

```ts
navigationPop: (methodName: string, clientId: string, swarmName: string) => Promise<string>
```

Pops the navigation stack or returns the default agent for the swarm, scoped to a client.
Wraps SwarmConnectionService.navigationPop with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., navigating agent flow in EXECUTE_FN) and SwarmMetaService (e.g., managing swarm navigation state).

### getCheckBusy

```ts
getCheckBusy: (methodName: string, clientId: string, swarmName: string) => Promise<boolean>
```

Returns the current busy state of the swarm.
Used to check if the swarm is currently processing an operation (e.g., waiting for output or switching agents).
Supports debugging and flow control in client applications.

### setBusy

```ts
setBusy: (isBusy: boolean, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Sets the busy state of the swarm, indicating whether it is currently processing an operation.
Wraps SwarmConnectionService.setBusy with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., marking swarm busy during EXECUTE_FN) and SessionPublicService (e.g., managing swarm state in connect).

### cancelOutput

```ts
cancelOutput: (methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Cancels the await of output in the swarm by emitting an empty string, scoped to a client.
Wraps SwarmConnectionService.cancelOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., interrupting EXECUTE_FN output) and SessionPublicService (e.g., output control in connect).

### waitForOutput

```ts
waitForOutput: (methodName: string, clientId: string, swarmName: string) => Promise<string>
```

Waits for output from the swarm, scoped to a client.
Wraps SwarmConnectionService.waitForOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., awaiting EXECUTE_FN results) and SessionPublicService (e.g., output handling in connect).

### getAgentName

```ts
getAgentName: (methodName: string, clientId: string, swarmName: string) => Promise<string>
```

Retrieves the current agent name from the swarm, scoped to a client.
Wraps SwarmConnectionService.getAgentName with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., identifying active agent in EXECUTE_FN) and AgentPublicService (e.g., agent context).

### getAgent

```ts
getAgent: (methodName: string, clientId: string, swarmName: string) => Promise<IAgent>
```

Retrieves the current agent instance from the swarm, scoped to a client.
Wraps SwarmConnectionService.getAgent with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., accessing agent details in EXECUTE_FN) and AgentPublicService (e.g., agent operations).

### setAgentRef

```ts
setAgentRef: (methodName: string, clientId: string, swarmName: string, agentName: string, agent: IAgent) => Promise<void>
```

Sets an agent reference in the swarm, associating an agent instance with an agent name, scoped to a client.
Wraps SwarmConnectionService.setAgentRef with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., configuring agents in EXECUTE_FN) and AgentPublicService (e.g., agent management).

### setAgentName

```ts
setAgentName: (agentName: string, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Sets the current agent name in the swarm, scoped to a client.
Wraps SwarmConnectionService.setAgentName with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., switching agents in EXECUTE_FN) and AgentPublicService (e.g., agent context updates).

### dispose

```ts
dispose: (methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Disposes of the swarm, cleaning up resources, scoped to a client.
Wraps SwarmConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN), SessionPublicService’s dispose, and PerfService’s resource management.
