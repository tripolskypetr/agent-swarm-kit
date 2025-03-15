# AgentConnectionService

Implements `IAgent`

Service class for managing agent connections and operations in the swarm system.
Implements IAgent to provide an interface for agent instantiation, execution, message handling, and lifecycle management.
Integrates with ClientAgent (core agent logic), AgentPublicService (public agent API), SessionPublicService (session context), HistoryPublicService (history management), and PerfService (tracking via BusService).
Uses memoization via functools-kit’s memoize to cache ClientAgent instances by clientId and agentName, ensuring efficient reuse.
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with schema services (AgentSchemaService, ToolSchemaService, CompletionSchemaService) for agent configuration, validation services (SessionValidationService) for usage tracking, and connection services (HistoryConnectionService, StorageConnectionService, StateConnectionService) for agent dependencies.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging agent operations.
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentPublicService and PerfService logging patterns.

### busService

```ts
busService: any
```

Bus service instance, injected via DI, for emitting agent-related events.
Passed to ClientAgent for execution events (e.g., commitExecutionBegin), aligning with BusService’s event system in SessionPublicService.

### methodContextService

```ts
methodContextService: any
```

Method context service instance, injected via DI, for accessing execution context.
Used to retrieve clientId and agentName in method calls, integrating with MethodContextService’s scoping in AgentPublicService.

### sessionValidationService

```ts
sessionValidationService: any
```

Session validation service instance, injected via DI, for tracking agent usage.
Used in getAgent and dispose to manage agent lifecycle, supporting SessionPublicService’s validation needs.

### historyConnectionService

```ts
historyConnectionService: any
```

History connection service instance, injected via DI, for managing agent history.
Provides history instances to ClientAgent, aligning with HistoryPublicService’s functionality.

### storageConnectionService

```ts
storageConnectionService: any
```

Storage connection service instance, injected via DI, for managing agent storage.
Initializes storage references in getAgent, supporting StoragePublicService’s client-specific storage operations.

### stateConnectionService

```ts
stateConnectionService: any
```

State connection service instance, injected via DI, for managing agent state.
Initializes state references in getAgent, supporting StatePublicService’s client-specific state operations.

### agentSchemaService

```ts
agentSchemaService: any
```

Agent schema service instance, injected via DI, for retrieving agent configurations.
Provides agent details (e.g., prompt, tools) in getAgent, aligning with AgentMetaService’s schema management.

### toolSchemaService

```ts
toolSchemaService: any
```

Tool schema service instance, injected via DI, for retrieving tool configurations.
Maps tools for ClientAgent in getAgent, supporting DocService’s tool documentation.

### completionSchemaService

```ts
completionSchemaService: any
```

Completion schema service instance, injected via DI, for retrieving completion configurations.
Provides completion logic to ClientAgent in getAgent, supporting agent execution flows.

### getAgent

```ts
getAgent: ((clientId: string, agentName: string) => ClientAgent) & IClearableMemoize<string> & IControlMemoize<string, ClientAgent>
```

Retrieves or creates a memoized ClientAgent instance for a given client and agent.
Uses functools-kit’s memoize to cache instances by a composite key (clientId-agentName), ensuring efficient reuse across calls.
Configures the agent with schema data (prompt, tools, completion) from AgentSchemaService, ToolSchemaService, and CompletionSchemaService, and initializes storage/state dependencies via StorageConnectionService and StateConnectionService.
Integrates with ClientAgent (agent logic), AgentPublicService (agent instantiation), and SessionValidationService (usage tracking).

### execute

```ts
execute: (input: string, mode: ExecutionMode) => Promise<void>
```

Executes an input command on the agent in a specified execution mode.
Delegates to ClientAgent.execute, using context from MethodContextService to identify the agent, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors AgentPublicService’s execute, supporting ClientAgent’s EXECUTE_FN and PerfService’s tracking.

### run

```ts
run: (input: string) => Promise<string>
```

Runs a stateless completion on the agent with the given input.
Delegates to ClientAgent.run, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors AgentPublicService’s run, supporting ClientAgent’s RUN_FN for quick completions.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for output from the agent, typically after an execution or run.
Delegates to ClientAgent.waitForOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Aligns with SessionPublicService’s waitForOutput and ClientAgent’s asynchronous output handling.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string) => Promise<void>
```

Commits tool output to the agent’s history, typically for OpenAI-style tool calls.
Delegates to ClientAgent.commitToolOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitToolOutput, supporting ClientAgent’s TOOL_EXECUTOR and HistoryPublicService.

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commits a system message to the agent’s history.
Delegates to ClientAgent.commitSystemMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitSystemMessage, supporting ClientAgent’s system prompt updates and HistoryPublicService.

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string) => Promise<void>
```

Commits an assistant message to the agent’s history.
Delegates to ClientAgent.commitAssistantMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitAssistantMessage, supporting ClientAgent’s assistant responses and HistoryPublicService.

### commitUserMessage

```ts
commitUserMessage: (message: string) => Promise<void>
```

Commits a user message to the agent’s history without triggering a response.
Delegates to ClientAgent.commitUserMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitUserMessage, supporting ClientAgent’s user input logging and HistoryPublicService.

### commitAgentChange

```ts
commitAgentChange: () => Promise<void>
```

Commits an agent change to prevent the next tool execution, altering the execution flow.
Delegates to ClientAgent.commitAgentChange, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent’s execution control, potentially tied to SwarmPublicService’s navigation changes.

### commitStopTools

```ts
commitStopTools: () => Promise<void>
```

Prevents the next tool from being executed in the agent’s workflow.
Delegates to ClientAgent.commitStopTools, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitStopTools, supporting ClientAgent’s TOOL_EXECUTOR interruption.

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Commits a flush of the agent’s history, clearing stored data.
Delegates to ClientAgent.commitFlush, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s commitFlush, supporting ClientAgent’s history reset and HistoryPublicService.

### dispose

```ts
dispose: () => Promise<void>
```

Disposes of the agent connection, cleaning up resources and clearing the memoized instance.
Checks if the agent exists in the memoization cache before calling ClientAgent.dispose, then clears the cache and updates SessionValidationService.
Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with AgentPublicService’s dispose and PerfService’s cleanup.
