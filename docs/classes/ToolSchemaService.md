---
title: docs/api-reference/class/ToolSchemaService
group: docs
---

# ToolSchemaService

Service class for managing tool schemas in the swarm system.
Provides a centralized registry for storing and retrieving IAgentTool instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
Integrates with AgentSchemaService (tool references in agent schemas via the tools field), ClientAgent (tool usage during execution), AgentConnectionService (agent instantiation with tools), and SwarmConnectionService (swarm-level agent execution).
Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
Serves as a foundational service for defining agent tools (e.g., call, validate, function properties) used by agents to perform specific tasks within the swarm ecosystem.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging tool schema operations.
Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentConnectionService and PerfService logging patterns.

### schemaContextService

```ts
schemaContextService: { readonly context: ISchemaContext; }
```

Schema context service instance, injected via DI, for managing schema-related context operations.
Provides utilities and methods to interact with schema contexts, supporting schema validation, retrieval, and updates.

### _registry

```ts
_registry: any
```

Registry instance for storing tool schemas, initialized with ToolRegistry from functools-kit.
Maps ToolName keys to IAgentTool values, providing efficient storage and retrieval, used in register and get methods.
Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.

### validateShallow

```ts
validateShallow: any
```

Validates a tool schema shallowly, ensuring required fields meet basic integrity constraints.
Checks toolName as a string, call and validate as functions (for tool execution and input validation), and function as an object (tool metadata), using isObject from functools-kit.
Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s tool integration needs.
Supports ClientAgent execution by ensuring tool schema validity before registration.

### register

```ts
register: (key: string, value: IAgentTool<Record<string, ToolValue>>) => void
```

Registers a new tool schema in the registry after validation.
Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (toolName).
Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentSchemaService’s tool references.
Supports ClientAgent execution by providing validated tool schemas to AgentConnectionService and SwarmConnectionService for agent tool integration.

### override

```ts
override: (key: string, value: Partial<IAgentTool<Record<string, ToolValue>>>) => IAgentTool<Record<string, ToolValue>>
```

Overrides an existing tool schema in the registry with a new schema.
Replaces the schema associated with the provided key (toolName) in the ToolRegistry.
Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports dynamic updates to tool schemas for AgentConnectionService and SwarmConnectionService.

### get

```ts
get: (key: string) => IAgentTool<Record<string, ToolValue>>
```

Retrieves a tool schema from the registry by its name.
Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports AgentConnectionService by providing tool definitions (e.g., call, validate, function) for agent instantiation, referenced in AgentSchemaService schemas via the tools field.
