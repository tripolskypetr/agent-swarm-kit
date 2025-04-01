---
title: docs/api-reference/class/SessionPublicService
group: docs
---

# SessionPublicService

Implements `TSessionConnectionService`

Service class for managing public session interactions in the swarm system.
Implements TSessionConnectionService to provide a public API for session-related operations, delegating to SessionConnectionService and wrapping calls with MethodContextService and ExecutionContextService for context scoping.
Integrates with ClientAgent (e.g., EXECUTE_FN, RUN_FN session execution), AgentPublicService (e.g., session-level messaging), PerfService (e.g., execution tracking in startExecution), BusService (e.g., commitExecutionBegin events), and SwarmMetaService (e.g., swarm context via swarmName).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like message emission, execution, connection handling, message commits, and session disposal.

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
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO or CC_LOGGER_ENABLE_LOG is true, consistent with AgentPublicService and PerfService logging patterns.

### perfService

```ts
perfService: any
```

Performance service instance, injected via DI, for tracking execution metrics.
Used in connect to measure execution duration (startExecution, endExecution), aligning with PerfService’s sessionState tracking.

### sessionConnectionService

```ts
sessionConnectionService: any
```

Session connection service instance, injected via DI, for underlying session operations.
Provides core functionality (e.g., emit, execute) called by public methods, supporting ClientAgent’s session model.

### busService

```ts
busService: any
```

Bus service instance, injected via DI, for emitting session-related events.
Used in connect to signal execution start and end (commitExecutionBegin, commitExecutionEnd), integrating with BusService’s event system.

### navigationValidationService

```ts
navigationValidationService: any
```

Service which prevent tool call to navigate client recursively

### notify

```ts
notify: (content: string, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Emits a message to the session, typically for asynchronous communication.
Delegates to ClientSession.emit, using context from MethodContextService to identify the session, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors SessionPublicService’s emit, supporting ClientAgent’s output handling and SwarmPublicService’s messaging.

### emit

```ts
emit: (content: string, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Emits a message to the session for a specific client and swarm.
Wraps SessionConnectionService.emit with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., session-level messaging) and AgentPublicService (e.g., swarm context emission).

### execute

```ts
execute: (content: string, mode: ExecutionMode, methodName: string, clientId: string, swarmName: string) => Promise<string>
```

Executes a command in the session with a specified execution mode.
Wraps SessionConnectionService.execute with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors ClientAgent’s EXECUTE_FN at the session level, triggering BusService events and PerfService tracking.

### run

```ts
run: (content: string, methodName: string, clientId: string, swarmName: string) => Promise<string>
```

Runs a stateless completion in the session with the given content.
Wraps SessionConnectionService.run with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors ClientAgent’s RUN_FN at the session level, used for quick completions without state persistence.

### connect

```ts
connect: (connector: SendMessageFn<void>, methodName: string, clientId: string, swarmName: string) => ReceiveMessageFn<string>
```

Connects to the session, establishing a messaging channel with performance tracking and event emission.
Uses SessionConnectionService.connect directly, wrapping execution in ExecutionContextService for detailed tracking, logging via LoggerService if enabled.
Integrates with ClientAgent (e.g., session-level messaging), PerfService (e.g., execution metrics), and BusService (e.g., execution events).

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Commits tool output to the session’s history, typically for OpenAI-style tool calls.
Wraps SessionConnectionService.commitToolOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent’s tool execution (e.g., TOOL_EXECUTOR), mirrored in AgentPublicService.

### commitSystemMessage

```ts
commitSystemMessage: (message: string, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Commits a system message to the session’s history.
Wraps SessionConnectionService.commitSystemMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., system prompt updates), mirrored in AgentPublicService.

### commitAssistantMessage

```ts
commitAssistantMessage: (message: string, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Commits an assistant message to the session’s history.
Wraps SessionConnectionService.commitAssistantMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent’s assistant responses, mirrored in AgentPublicService and tracked by PerfService.

### commitUserMessage

```ts
commitUserMessage: (message: string, mode: ExecutionMode, methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Commits a user message to the session’s history without triggering an answer.
Wraps SessionConnectionService.commitUserMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent for user input logging, mirrored in AgentPublicService.

### commitFlush

```ts
commitFlush: (methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Commits a flush of the session’s history, clearing stored data.
Wraps SessionConnectionService.commitFlush with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent session resets, mirrored in AgentPublicService and tracked by PerfService.

### commitStopTools

```ts
commitStopTools: (methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Commits a stop to prevent the next tool from being executed in the session.
Wraps SessionConnectionService.commitStopTools with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent’s tool execution control (e.g., TOOL_EXECUTOR interruption), mirrored in AgentPublicService.

### dispose

```ts
dispose: (methodName: string, clientId: string, swarmName: string) => Promise<void>
```

Disposes of the session, cleaning up resources.
Wraps SessionConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Aligns with AgentPublicService’s dispose and PerfService’s session cleanup.
