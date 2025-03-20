# HistoryConnectionService

Implements `IHistory`

Service class for managing history connections and operations in the swarm system.
Implements IHistory to provide an interface for history instance management, message manipulation, and conversion, scoped to clientId and agentName.
Integrates with ClientAgent (history in agent execution), AgentConnectionService (history provision), HistoryPublicService (public history API), SessionPublicService (session context), and PerfService (tracking via BusService).
Uses memoization via functools-kit’s memoize to cache ClientHistory instances by a composite key (clientId-agentName), ensuring efficient reuse across calls.
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with SessionValidationService for usage tracking and BusService for event emission.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging history operations.
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with HistoryPublicService and PerfService logging patterns.

### busService

```ts
busService: any
```

Bus service instance, injected via DI, for emitting history-related events.
Passed to ClientHistory for event propagation (e.g., history updates), aligning with BusService’s event system in AgentConnectionService.

### methodContextService

```ts
methodContextService: any
```

Method context service instance, injected via DI, for accessing execution context.
Used to retrieve clientId and agentName in method calls, integrating with MethodContextService’s scoping in HistoryPublicService.

### sessionValidationService

```ts
sessionValidationService: any
```

Session validation service instance, injected via DI, for tracking history usage.
Used in getHistory and dispose to manage history lifecycle, supporting SessionPublicService’s validation needs.

### getHistory

```ts
getHistory: ((clientId: string, agentName: string) => ClientHistory) & IClearableMemoize<string> & IControlMemoize<string, ClientHistory>
```

Retrieves or creates a memoized ClientHistory instance for a given client and agent.
Uses functools-kit’s memoize to cache instances by a composite key (clientId-agentName), ensuring efficient reuse across calls.
Initializes the history with items from GLOBAL_CONFIG.CC_GET_AGENT_HISTORY_ADAPTER, and integrates with SessionValidationService for usage tracking.
Supports ClientAgent (history in EXECUTE_FN), AgentConnectionService (history provision), and HistoryPublicService (public API).

### push

```ts
push: (message: IModelMessage) => Promise<void>
```

Pushes a message to the agent’s history.
Delegates to ClientHistory.push, using context from MethodContextService to identify the history instance, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors HistoryPublicService’s push, supporting ClientAgent’s history updates (e.g., via commit methods in AgentConnectionService).

### pop

```ts
pop: () => Promise<IModelMessage>
```

Pops the most recent message from the agent’s history.
Delegates to ClientHistory.pop, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors HistoryPublicService’s pop, supporting ClientAgent’s history manipulation.

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string) => Promise<IModelMessage[]>
```

Converts the agent’s history to an array formatted for agent use, incorporating a prompt.
Delegates to ClientHistory.toArrayForAgent, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors HistoryPublicService’s toArrayForAgent, supporting ClientAgent’s execution context (e.g., EXECUTE_FN with prompt).

### toArrayForRaw

```ts
toArrayForRaw: () => Promise<IModelMessage[]>
```

Converts the agent’s history to a raw array of messages.
Delegates to ClientHistory.toArrayForRaw, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors HistoryPublicService’s toArrayForRaw, supporting ClientAgent’s raw history access or external reporting.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the history connection, cleaning up resources and clearing the memoized instance.
Checks if the history exists in the memoization cache before calling ClientHistory.dispose, then clears the cache and updates SessionValidationService.
Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with HistoryPublicService’s dispose and PerfService’s cleanup.
