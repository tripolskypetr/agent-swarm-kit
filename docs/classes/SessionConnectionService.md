---
title: docs/api-reference/class/SessionConnectionService
group: docs
---

# SessionConnectionService

Implements `ISession`

Service class for managing session connections and operations in the swarm system.
Implements ISession to provide an interface for session instance management, messaging, execution, and lifecycle operations, scoped to clientId and swarmName.
Integrates with ClientAgent (agent execution within sessions), SessionPublicService (public session API), SwarmPublicService (swarm-level operations), PolicyPublicService (policy enforcement), AgentConnectionService (agent integration), and PerfService (tracking via BusService).
Uses memoization via functools-kit’s memoize to cache ClientSession instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with SwarmConnectionService for swarm access, PolicyConnectionService for policy enforcement, and SwarmSchemaService for swarm configuration.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging session operations.
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.

### busService

```ts
busService: any
```

Bus service instance, injected via DI, for emitting session-related events.
Passed to ClientSession for event propagation (e.g., execution events), aligning with BusService’s event system in AgentConnectionService.

### methodContextService

```ts
methodContextService: any
```

Method context service instance, injected via DI, for accessing execution context.
Used to retrieve clientId and swarmName in method calls, integrating with MethodContextService’s scoping in SessionPublicService.

### swarmConnectionService

```ts
swarmConnectionService: any
```

Swarm connection service instance, injected via DI, for managing swarm instances.
Provides swarm access to ClientSession in getSession, supporting SwarmPublicService’s swarm-level operations.

### policyConnectionService

```ts
policyConnectionService: any
```

Policy connection service instance, injected via DI, for managing policy instances.
Provides policy enforcement to ClientSession in getSession, integrating with PolicyPublicService and PolicyConnectionService.

### swarmSchemaService

```ts
swarmSchemaService: any
```

Swarm schema service instance, injected via DI, for retrieving swarm configurations.
Provides callbacks and policies to ClientSession in getSession, aligning with SwarmMetaService’s schema management.

### getSession

```ts
getSession: ((clientId: string, swarmName: string) => ClientSession) & IClearableMemoize<string> & IControlMemoize<string, ClientSession>
```

Retrieves or creates a memoized ClientSession instance for a given client and swarm.
Uses functools-kit’s memoize to cache instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
Configures the session with swarm data from SwarmSchemaService, policies from PolicyConnectionService (merged via MergePolicy or defaulting to NoopPolicy), and swarm access from SwarmConnectionService.
Supports ClientAgent (session context for execution), SessionPublicService (public API), and SwarmPublicService (swarm integration).

### notify

```ts
notify: (message: string) => Promise<void>
```

Sends a notification message to connect listeners via the internal `_notifySubject`.
Logs the notification if debugging is enabled.

### emit

```ts
emit: (content: string) => Promise<void>
```

Emits a message to the session, typically for asynchronous communication.
Delegates to ClientSession.emit, using context from MethodContextService to identify the session, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s emit, supporting ClientAgent’s output handling and SwarmPublicService’s messaging.

### execute

```ts
execute: (content: string, mode: ExecutionMode) => Promise<string>
```

Executes a command in the session with a specified execution mode.
Delegates to ClientSession.execute, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s execute, supporting ClientAgent’s EXECUTE_FN within a session context and PerfService tracking.

### run

```ts
run: (content: string) => Promise<string>
```

Runs a stateless completion in the session with the given content.
Delegates to ClientSession.run, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s run, supporting ClientAgent’s RUN_FN within a session context.

### connect

```ts
connect: (connector: SendMessageFn<void>, clientId: string, swarmName: string) => ReceiveMessageFn<string>
```

Connects to the session using a provided send message function, returning a receive message function.
Delegates to ClientSession.connect, explicitly passing clientId and swarmName, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s connect, supporting ClientAgent’s bidirectional communication and SwarmPublicService’s swarm interactions.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string) => Promise<void>
```

Commits tool output to the session’s history, typically for OpenAI-style tool calls.
Delegates to ClientSession.commitToolOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitToolOutput, supporting ClientAgent’s TOOL_EXECUTOR and HistoryPublicService integration.

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commits a system message to the session’s history.
Delegates to ClientSession.commitSystemMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitSystemMessage, supporting ClientAgent’s system updates and HistoryPublicService.

### commitDeveloperMessage

```ts
commitDeveloperMessage: (message: string) => Promise<void>
```

Commits a developer message to the session’s history.
Delegates to ClientSession.commitDeveloperMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitDeveloperMessage, supporting ClientAgent’s developer updates and HistoryPublicService.

### commitToolRequest

```ts
commitToolRequest: (request: IToolRequest[]) => Promise<string[]>
```

Commits a tool request to the session’s history.
Delegates to ClientSession.commitToolRequest, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitToolRequest, supporting ClientAgent’s tool requests and HistoryPublicService integration.

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string) => Promise<void>
```

Commits an assistant message to the session’s history.
Delegates to ClientSession.commitAssistantMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitAssistantMessage, supporting ClientAgent’s assistant responses and HistoryPublicService.

### commitUserMessage

```ts
commitUserMessage: (message: string, mode: ExecutionMode) => Promise<void>
```

Commits a user message to the session’s history without triggering a response.
Delegates to ClientSession.commitUserMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitUserMessage, supporting ClientAgent’s user input logging and HistoryPublicService.

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Commits a flush of the session’s history, clearing stored data.
Delegates to ClientSession.commitFlush, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitFlush, supporting ClientAgent’s history reset and HistoryPublicService.

### commitStopTools

```ts
commitStopTools: () => Promise<void>
```

Prevents the next tool from being executed in the session’s workflow.
Delegates to ClientSession.commitStopTools, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitStopTools, supporting ClientAgent’s TOOL_EXECUTOR interruption.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the session connection, cleaning up resources and clearing the memoized instance.
Checks if the session exists in the memoization cache before calling ClientSession.dispose, then clears the cache.
Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with SessionPublicService’s dispose and PerfService’s cleanup.
