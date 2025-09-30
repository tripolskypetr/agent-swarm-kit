---
title: docs/api-reference/interface/IGlobalConfig
group: docs
---

# IGlobalConfig

Interface defining the global configuration settings and behaviors for the swarm system.
Centralizes constants and functions used across components like `ClientAgent` (e.g., tool handling, logging, history).
Influences workflows such as message processing (`CC_EMPTY_OUTPUT_PLACEHOLDERS` in `RUN_FN`), tool call recovery (`CC_RESQUE_STRATEGY` in `_resurrectModel`), and logging (`CC_LOGGER_ENABLE_DEBUG`).
Customizable via `setConfig` to adapt system behavior dynamically.

## Properties

### CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT

```ts
CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT: string
```

A prompt used to flush the conversation when tool call exceptions occur, specifically for troubleshooting in `llama3.1:8b` models.
Applied in `ClientAgent._resurrectModel` with the "flush" strategy to reset the conversation state. Requires `CC_OLLAMA_EMIT_TOOL_PROTOCOL` to be disabled.

### CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT

```ts
CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT: string
```

A multi-line prompt to recomplete invalid tool calls, designed as a fix for intermittent issues in `IlyaGusev/saiga_yandexgpt_8b_gguf` (LMStudio).
Used in `ClientAgent.getCompletion` with the "recomplete" strategy, instructing the model to analyze, correct, and explain tool call errors.

### CC_EMPTY_OUTPUT_PLACEHOLDERS

```ts
CC_EMPTY_OUTPUT_PLACEHOLDERS: string[]
```

An array of placeholder responses for empty model outputs, used in `ClientAgent.createPlaceholder` to greet or prompt the user.
Randomly selected in `ClientAgent._resurrectModel` or `RUN_FN` when output is empty, enhancing user experience by avoiding silent failures.

### CC_KEEP_MESSAGES

```ts
CC_KEEP_MESSAGES: number
```

Maximum number of messages to retain in history, used indirectly in `ClientAgent.history` management.
Limits history to 15 messages, though not explicitly enforced in provided `ClientAgent` code.

### CC_MAX_TOOL_CALLS

```ts
CC_MAX_TOOL_CALLS: number
```

Maximum number of tool calls allowed per execution, used in `ClientAgent.EXECUTE_FN` to cap `toolCalls`.
Limits to 1 tool call by default, preventing excessive tool invocation loops in a single run.

### CC_AGENT_MAP_TOOLS

```ts
CC_AGENT_MAP_TOOLS: (tool: IToolCall[], clientId: string, agentName: string) => IToolCall[] | Promise<IToolCall[]>
```

Function to map tool calls for an agent, used in `ClientAgent.mapToolCalls` (e.g., `EXECUTE_FN`).
Default implementation returns tools unchanged, allowing customization of `IToolCall` processing via `setConfig`.

### CC_GET_AGENT_HISTORY_ADAPTER

```ts
CC_GET_AGENT_HISTORY_ADAPTER: (clientId: string, agentName: string) => IHistoryAdapter
```

Factory function to provide a history adapter for an agent, used in `ClientAgent.history` (e.g., `getCompletion`).
Returns `HistoryAdapter` by default, implementing `IHistoryAdapter` for message storage and retrieval.

### CC_GET_CLIENT_LOGGER_ADAPTER

```ts
CC_GET_CLIENT_LOGGER_ADAPTER: () => ILoggerAdapter
```

Factory function to provide a logger adapter for clients, used in `ClientAgent.logger` (e.g., debug logging).
Returns `LoggerAdapter` by default, implementing `ILoggerAdapter` for logging control across the system.

### CC_SWARM_AGENT_CHANGED

```ts
CC_SWARM_AGENT_CHANGED: (clientId: string, agentName: string, swarmName: string) => Promise<void>
```

Callback function triggered when the active agent changes in a swarm, used in swarm-related logic (e.g., `ISwarmParams`).
Default implementation is a no-op, observed indirectly in `ClientAgent.commitAgentChange` via `IBus.emit "commit-agent-change"`.

### CC_SWARM_DEFAULT_AGENT

```ts
CC_SWARM_DEFAULT_AGENT: (clientId: string, swarmName: string, defaultAgent: string) => Promise<string>
```

Function to determine the default agent for a swarm, used in swarm initialization (e.g., `ISwarmParams`).
Default implementation returns the provided `defaultAgent`, aligning with swarm-agent hierarchy logic, though not directly observed in `ClientAgent`.

### CC_SWARM_DEFAULT_STACK

```ts
CC_SWARM_DEFAULT_STACK: (clientId: string, swarmName: string) => Promise<string[]>
```

Function to provide the default navigation stack for a swarm, used in `ISwarmParams` initialization.
Default implementation returns an empty array, part of swarm navigation setup, though not directly used in `ClientAgent`.

### CC_SWARM_STACK_CHANGED

```ts
CC_SWARM_STACK_CHANGED: (clientId: string, navigationStack: string[], swarmName: string) => Promise<void>
```

Callback function triggered when the navigation stack changes in a swarm, used in `ISwarmParams` (e.g., `navigationPop`).
Default implementation is a no-op, indirectly related to `ClientAgent.commitAgentChange` for stack updates.

### CC_AGENT_DEFAULT_VALIDATION

```ts
CC_AGENT_DEFAULT_VALIDATION: (output: string) => string | Promise<string>
```

Default validation function for agent outputs, used in `ClientAgent.validate` (e.g., `RUN_FN`, `EXECUTE_FN`).
Imported from `validateDefault`, returns null if valid or an error string if invalid, ensuring output correctness.

### CC_AGENT_HISTORY_FILTER

```ts
CC_AGENT_HISTORY_FILTER: (agentName: string) => (message: IModelMessage<object>) => boolean
```

Filter function for agent history, used in `ClientAgent.history.toArrayForAgent` to scope messages.
Ensures only relevant messages (e.g., matching `agentName` for "tool" or `tool_calls`) are included in completions.

### CC_AGENT_OUTPUT_TRANSFORM

```ts
CC_AGENT_OUTPUT_TRANSFORM: (input: string, clientId: string, agentName: string) => string | Promise<string>
```

Default transformation function for agent outputs, used in `ClientAgent.transform` (e.g., `RUN_FN`, `_emitOutput`).
Removes XML tags via `removeXmlTags` based on `CC_AGENT_DISALLOWED_TAGS` to clean responses for consistency.

### CC_AGENT_OUTPUT_MAP

```ts
CC_AGENT_OUTPUT_MAP: (message: IModelMessage<object>) => IModelMessage<object> | Promise<IModelMessage<object>>
```

Function to map model messages for agent output, used in `ClientAgent.map` (e.g., `RUN_FN`, `EXECUTE_FN`).
Default implementation returns the message unchanged, allowing customization of `IModelMessage` via `setConfig`.

### CC_AGENT_SYSTEM_PROMPT

```ts
CC_AGENT_SYSTEM_PROMPT: string[]
```

Optional system prompt for agents, used in `ClientAgent.history.toArrayForAgent` (e.g., `getCompletion`).
Undefined by default, allowing optional agent-specific instructions to be added to history via `setConfig`.

### CC_AGENT_DISALLOWED_TAGS

```ts
CC_AGENT_DISALLOWED_TAGS: string[]
```

Array of XML tags disallowed in agent outputs, used with `CC_AGENT_OUTPUT_TRANSFORM` in `ClientAgent.transform`.
Filters out tags like "tool_call" via `removeXmlTags` in `RUN_FN` to clean responses for downstream processing.

### CC_AGENT_DISALLOWED_SYMBOLS

```ts
CC_AGENT_DISALLOWED_SYMBOLS: string[]
```

Array of symbols disallowed in agent outputs, potentially used in validation or transformation logic.
Includes curly braces, suggesting filtering of JSON-like structures, though not directly observed in `ClientAgent`.

### CC_STORAGE_SEARCH_SIMILARITY

```ts
CC_STORAGE_SEARCH_SIMILARITY: number
```

Similarity threshold for storage searches, used in `IStorage.take` for similarity-based retrieval.
Set to 0.65, defining the minimum similarity score for search results, though not directly in `ClientAgent`.

### CC_STORAGE_SEARCH_POOL

```ts
CC_STORAGE_SEARCH_POOL: number
```

Maximum number of results for storage searches, used in `IStorage.take` to limit retrieval.
Caps search pool at 5 items by default, though not directly observed in `ClientAgent`.

### CC_LOGGER_ENABLE_INFO

```ts
CC_LOGGER_ENABLE_INFO: boolean
```

Flag to enable info-level logging, used in `ClientAgent.logger` for informational logs.
Disabled by default (false), controlling verbosity of `ILoggerAdapter` logs.

### CC_LOGGER_ENABLE_DEBUG

```ts
CC_LOGGER_ENABLE_DEBUG: boolean
```

Flag to enable debug-level logging, used extensively in `ClientAgent.logger.debug` (e.g., `RUN_FN`, `EXECUTE_FN`).
Disabled by default (false), gating detailed debug output in `ILoggerAdapter`.

### CC_LOGGER_ENABLE_LOG

```ts
CC_LOGGER_ENABLE_LOG: boolean
```

Flag to enable general logging, used in `ClientAgent.logger` for basic log output.
Enabled by default (true), ensuring core logging functionality in `ILoggerAdapter`.

### CC_LOGGER_ENABLE_CONSOLE

```ts
CC_LOGGER_ENABLE_CONSOLE: boolean
```

Flag to enable console logging, used in `ClientAgent.logger` for direct console output.
Disabled by default (false), allowing logs to be redirected via `ILoggerAdapter`.

### CC_RESQUE_STRATEGY

```ts
CC_RESQUE_STRATEGY: "flush" | "recomplete" | "custom"
```

Strategy for handling model resurrection, used in `ClientAgent._resurrectModel` and `getCompletion`.
Options: "flush" (reset conversation), "recomplete" (retry tool calls), "custom" (user-defined); determines recovery approach for invalid outputs or tool calls.

### CC_NAME_TO_TITLE

```ts
CC_NAME_TO_TITLE: (name: string) => string
```

Utility function to convert names to title case, used for UI or logging readability.
Imported from `nameToTitle`, enhancing presentation of agent or swarm names, though not directly in `ClientAgent`.

### CC_FN_PLANTUML

```ts
CC_FN_PLANTUML: (uml: string) => Promise<string>
```

Function to process PlantUML diagrams, potentially for visualization purposes.
Default returns an empty string, allowing custom UML rendering logic via `setConfig`, though not directly in `ClientAgent`.

### CC_PROCESS_UUID

```ts
CC_PROCESS_UUID: string
```

Unique identifier for the current process, used system-wide for tracking or logging.
Generated via `randomString`, providing a process-specific UUID, though not directly in `ClientAgent`.

### CC_BANHAMMER_PLACEHOLDER

```ts
CC_BANHAMMER_PLACEHOLDER: string
```

Placeholder response for banned topics or actions, used in `IPolicy.banClient` enforcement.
Indicates refusal to engage, enhancing policy messaging, though not directly in `ClientAgent`.

### CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION

```ts
CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: (clientId: string, agentName: string) => Promise<IModelMessage<object>>
```

A custom function to handle tool call exceptions by returning a model message or null, used in `ClientAgent.getCompletion` with the "custom" `CC_RESQUE_STRATEGY`.
Default implementation returns null, allowing override via `setConfig` to implement specific recovery logic tailored to the application.

### CC_PERSIST_ENABLED_BY_DEFAULT

```ts
CC_PERSIST_ENABLED_BY_DEFAULT: boolean
```

Flag to enable persistence by default, used in `IStorage` or `IState` initialization.
Enabled (true) by default, suggesting data retention unless overridden, though not directly in `ClientAgent`.

### CC_AUTOBAN_ENABLED_BY_DEFAULT

```ts
CC_AUTOBAN_ENABLED_BY_DEFAULT: boolean
```

Flag to enable autobanning by default, used in `IPolicy` for automatic ban enforcement.
Disabled (false) by default, allowing manual ban control unless overridden, though not directly in `ClientAgent`.

### CC_DEFAULT_STATE_SET

```ts
CC_DEFAULT_STATE_SET: <T = any>(state: T, clientId: string, stateName: string) => Promise<void>
```

Default function to set state values, used in `IState.setState` for state persistence.
No-op by default, allowing state updates to be customized via `setConfig`, though not directly in `ClientAgent`.

### CC_DEFAULT_STATE_GET

```ts
CC_DEFAULT_STATE_GET: <T = any>(clientId: string, stateName: string, defaultState: T) => Promise<T>
```

Default function to get state values, used in `IState.getState` for state retrieval.
Returns `defaultState` by default, allowing state retrieval to be customized via `setConfig`, though not directly in `ClientAgent`.

### CC_DEFAULT_POLICY_GET_BAN_CLIENTS

```ts
CC_DEFAULT_POLICY_GET_BAN_CLIENTS: (policyName: string, swarmName: string) => string[] | Promise<string[]>
```

Default function to get banned clients for the policy

### CC_DEFAULT_POLICY_GET

```ts
CC_DEFAULT_POLICY_GET: (policyName: string, swarmName: string) => string[] | Promise<string[]>
```

Retrieves the list of currently banned clients under this policy.

### CC_DEFAULT_POLICY_SET

```ts
CC_DEFAULT_POLICY_SET: (clientIds: string[], policyName: string, swarmName: string) => void | Promise<void>
```

Optional function to set the list of banned clients.
Overrides default ban list management if provided.

### CC_DEFAULT_STORAGE_GET

```ts
CC_DEFAULT_STORAGE_GET: <T extends IStorageData = IStorageData>(clientId: string, storageName: string, defaultValue: T[]) => Promise<T[]>
```

Default function to get storage data, used in `IStorage.take` for storage retrieval.
Returns `defaultValue` by default, allowing storage retrieval to be customized via `setConfig`, though not directly in `ClientAgent`.

### CC_DEFAULT_STORAGE_SET

```ts
CC_DEFAULT_STORAGE_SET: <T extends IStorageData = IStorageData>(data: T[], clientId: string, storageName: string) => Promise<void>
```

Default function to set storage data, used in `IStorage.upsert` for storage persistence.
No-op by default, allowing storage updates to be customized via `setConfig`, though not directly in `ClientAgent`.

### CC_SKIP_POSIX_RENAME

```ts
CC_SKIP_POSIX_RENAME: boolean
```

Flag to skip POSIX-style renaming, potentially for file operations in persistence layers.
Disabled (false) by default, ensuring standard renaming unless overridden, though not directly in `ClientAgent`.

### CC_PERSIST_MEMORY_STORAGE

```ts
CC_PERSIST_MEMORY_STORAGE: boolean
```

Flag to enable persistent storage for `Schema.readValue` and `Schema.writeValue`, separate from general persistence.
Enabled (true) by default, ensuring memory storage persistence unless overridden.

### CC_PERSIST_EMBEDDING_CACHE

```ts
CC_PERSIST_EMBEDDING_CACHE: boolean
```

Flag to enable persistent cache for `embeddings`. Will allow to reduce costs while using openai
Disabled (false) by default which faster for ollama local embeddings

### CC_DEFAULT_READ_EMBEDDING_CACHE

```ts
CC_DEFAULT_READ_EMBEDDING_CACHE: (embeddingName: string, stringHash: string) => number[] | Promise<number[]>
```

Retrieves the embedding vector for a specific string hash, returning null if not found.
Used to check if a precomputed embedding exists in the cache.

### CC_DEFAULT_WRITE_EMBEDDING_CACHE

```ts
CC_DEFAULT_WRITE_EMBEDDING_CACHE: (embeddings: number[], embeddingName: string, stringHash: string) => void | Promise<void>
```

Stores an embedding vector for a specific string hash, persisting it for future retrieval.
Used to cache computed embeddings to avoid redundant processing.

### CC_DEFAULT_AGENT_TOOL_VALIDATE

```ts
CC_DEFAULT_AGENT_TOOL_VALIDATE: (dto: { clientId: string; agentName: string; toolCalls: IToolCall[]; params: unknown; }) => boolean | Promise<boolean>
```

Validates the tool parameters before execution.
Can return synchronously or asynchronously based on validation complexity.

### CC_THROW_WHEN_NAVIGATION_RECURSION

```ts
CC_THROW_WHEN_NAVIGATION_RECURSION: boolean
```

Throw an error if agents being changed recursively

### CC_DEFAULT_CONNECT_OPERATOR

```ts
CC_DEFAULT_CONNECT_OPERATOR: (clientId: string, agentName: string) => (message: string, next: (answer: string) => void) => DisposeFn$1
```

Default function to connect an operator for handling messages and responses.
Establishes a connection between a client and an agent, allowing messages to be sent
and answers to be received via a callback mechanism.

### CC_ENABLE_OPERATOR_TIMEOUT

```ts
CC_ENABLE_OPERATOR_TIMEOUT: boolean
```

Flag to enable operator timeout, used in `ClientOperator` for message processing.

### CC_STORAGE_DISABLE_GET_DATA

```ts
CC_STORAGE_DISABLE_GET_DATA: boolean
```

Disable fetch of data from all storages. Quite usefull for unit tests

### CC_MAX_NESTED_EXECUTIONS

```ts
CC_MAX_NESTED_EXECUTIONS: number
```

When the model run more than 10 nested tool call iterations including
navigations throw an exeption
