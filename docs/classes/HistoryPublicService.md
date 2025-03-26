---
title: docs/api-reference/class/HistoryPublicService
group: docs
---

# HistoryPublicService

Implements `THistoryConnectionService`

Service class for managing public history operations in the swarm system.
Implements THistoryConnectionService to provide a public API for history interactions, delegating to HistoryConnectionService and wrapping calls with MethodContextService for context scoping.
Integrates with ClientAgent (e.g., message history in EXECUTE_FN), AgentPublicService (e.g., commitSystemMessage pushing to history), PerfService (e.g., session tracking via clientId), and DocService (e.g., history documentation).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like pushing messages, popping messages, converting history to arrays, and disposal.

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
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentPublicService and DocService logging patterns.

### historyConnectionService

```ts
historyConnectionService: any
```

History connection service instance, injected via DI, for underlying history operations.
Provides core functionality (e.g., push, pop) called by public methods, aligning with ClientAgent’s history management.

### push

```ts
push: (message: IModelMessage<object>, methodName: string, clientId: string, agentName: string) => Promise<void>
```

Pushes a message to the agent’s history for a specific client and method context.
Wraps HistoryConnectionService.push with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in AgentPublicService (e.g., commitSystemMessage, commitUserMessage) and ClientAgent (e.g., EXECUTE_FN message logging).

### pop

```ts
pop: (methodName: string, clientId: string, agentName: string) => Promise<IModelMessage<object>>
```

Pops the most recent message from the agent’s history.
Wraps HistoryConnectionService.pop with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., retrieving last message in EXECUTE_FN) and AgentPublicService (e.g., history manipulation).

### toArrayForAgent

```ts
toArrayForAgent: (prompt: string, methodName: string, clientId: string, agentName: string) => Promise<IModelMessage<object>[]>
```

Converts the agent’s history to an array tailored for agent processing, incorporating a prompt.
Wraps HistoryConnectionService.toArrayForAgent with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., EXECUTE_FN context preparation) and DocService (e.g., history documentation with prompts).

### toArrayForRaw

```ts
toArrayForRaw: (methodName: string, clientId: string, agentName: string) => Promise<IModelMessage<object>[]>
```

Converts the agent’s history to a raw array of items.
Wraps HistoryConnectionService.toArrayForRaw with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., raw history access in EXECUTE_FN) and PerfService (e.g., history-based performance metrics).

### dispose

```ts
dispose: (methodName: string, clientId: string, agentName: string) => Promise<void>
```

Disposes of the agent’s history, cleaning up resources.
Wraps HistoryConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Aligns with AgentPublicService’s dispose (e.g., agent cleanup) and PerfService’s dispose (e.g., session cleanup).
