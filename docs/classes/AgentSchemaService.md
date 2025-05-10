---
title: docs/api-reference/class/AgentSchemaService
group: docs
---

# AgentSchemaService

Service class for managing agent schemas in the swarm system.
Provides a centralized registry for storing and retrieving IAgentSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
Integrates with AgentConnectionService (agent instantiation using schemas), SwarmConnectionService (swarm agent configuration), ClientAgent (schema-driven execution), and AgentMetaService (meta-level agent management).
Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
Serves as a foundational service for defining agent behavior, dependencies, and resources (e.g., states, storages, tools) within the swarm ecosystem.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

Logger service instance, injected via DI, for logging schema operations.
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

Registry instance for storing agent schemas, initialized with ToolRegistry from functools-kit.
Maps AgentName keys to IAgentSchema values, providing efficient storage and retrieval, used in register and get methods.
Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.

### validateShallow

```ts
validateShallow: any
```

Validates an agent schema shallowly, ensuring required fields and array properties meet basic integrity constraints.
Checks agentName, completion, and prompt as strings; ensures system, dependsOn, states, storages, and tools are arrays of unique strings if present.
Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s validation needs.
Supports ClientAgent instantiation by ensuring schema validity before registration.

### register

```ts
register: (key: string, value: IAgentSchema) => void
```

Registers a new agent schema in the registry after validation.
Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (agentName).
Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s schema usage.
Supports ClientAgent instantiation by providing validated schemas to AgentConnectionService and SwarmConnectionService.

### override

```ts
override: (key: string, value: Partial<IAgentSchema>) => IAgentSchema
```

Overrides an existing agent schema in the registry with a new schema.
Replaces the schema associated with the provided key (agentName) in the ToolRegistry.
Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports dynamic updates to agent schemas for AgentConnectionService and SwarmConnectionService.

### get

```ts
get: (key: string) => IAgentSchema
```

Retrieves an agent schema from the registry by its name.
Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports AgentConnectionService’s getAgent method by providing schema data for agent instantiation, and SwarmConnectionService’s swarm configuration.
