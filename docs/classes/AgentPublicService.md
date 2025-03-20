# AgentPublicService

Implements `TAgentConnectionService`

Service class for managing public agent operations in the swarm system.
Implements TAgentConnectionService to provide a public API for agent interactions, delegating to AgentConnectionService and wrapping calls with MethodContextService for context scoping.
Integrates with ClientAgent (e.g., EXECUTE_FN, RUN_FN execution), PerfService (e.g., execution tracking via execute), DocService (e.g., agent documentation via agentName), and BusService (e.g., execution events via clientId).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like agent creation, execution, message commits, and disposal.

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
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with DocService and PerfService logging patterns.

### agentConnectionService

```ts
agentConnectionService: any
```

Agent connection service instance, injected via DI, for underlying agent operations.
Provides core functionality (e.g., getAgent, execute) called by public methods, aligning with ClientAgent’s execution model.

### createAgentRef

```ts
createAgentRef: (methodName: string, clientId: string, agentName: string) => Promise<ClientAgent>
```

Creates a reference to an agent for a specific client and method context.
Wraps AgentConnectionService.getAgent with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., to initialize agent refs) and PerfService (e.g., to track agent usage via clientId).

### execute

```ts
execute: (input: string, mode: ExecutionMode, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Executes a command on the agent with a specified execution mode.
Wraps AgentConnectionService.execute with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors ClientAgent’s EXECUTE_FN, triggering BusService events (e.g., commitExecutionBegin) and PerfService tracking (e.g., startExecution).

### run

```ts
run: (input: string, methodName: string, clientId: string, agentName: string) => Promise<string>
```

Runs a stateless completion on the agent with the given input.
Wraps AgentConnectionService.run with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors ClientAgent’s RUN_FN, used for quick completions without state persistence, tracked by PerfService.

### waitForOutput

```ts
waitForOutput: (methodName: string, clientId: string, agentName: string) => Promise<string>
```

Waits for the agent’s output after an operation.
Wraps AgentConnectionService.waitForOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., post-execution output retrieval), complementing execute and run.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits tool output to the agent’s history, typically for OpenAI-style tool calls.
Wraps AgentConnectionService.commitToolOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent’s tool execution (e.g., TOOL_EXECUTOR), documented in DocService (e.g., tool schemas).

### commitSystemMessage

```ts
commitSystemMessage: (message: string, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits a system message to the agent’s history.
Wraps AgentConnectionService.commitSystemMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., system prompt updates), documented in DocService (e.g., system prompts).

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits an assistant message to the agent’s history.
Wraps AgentConnectionService.commitAssistantMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent’s assistant responses, tracked by PerfService and documented in DocService.

### commitUserMessage

```ts
commitUserMessage: (message: string, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits a user message to the agent’s history without triggering an answer.
Wraps AgentConnectionService.commitUserMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent for user input logging, complementing execute and run.

### commitFlush

```ts
commitFlush: (methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits a flush of the agent’s history, clearing stored data.
Wraps AgentConnectionService.commitFlush with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent session resets, tracked by PerfService for performance cleanup.

### commitAgentChange

```ts
commitAgentChange: (methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits a change of agent to prevent subsequent tool executions.
Wraps AgentConnectionService.commitAgentChange with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent to manage agent transitions, documented in DocService (e.g., agent dependencies).

### commitStopTools

```ts
commitStopTools: (methodName: string, clientId: string, agentName: string) => Promise<void>
```

Commits a stop to prevent the next tool from being executed.
Wraps AgentConnectionService.commitStopTools with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent’s tool execution control (e.g., TOOL_EXECUTOR interruption).

### dispose

```ts
dispose: (methodName: string, clientId: string, agentName: string) => Promise<void>
```

Disposes of the agent, cleaning up resources.
Wraps AgentConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Aligns with PerfService’s dispose (e.g., session cleanup) and BusService’s dispose (e.g., subscription cleanup).
