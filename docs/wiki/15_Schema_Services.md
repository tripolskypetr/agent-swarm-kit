---
title: design/15_schema_service
group: design
---

# Schema Services

Schema Services provide centralized component definition and configuration management for the agent-swarm-kit framework. They serve as the foundational layer that defines how agents, tools, completions, storages, states, and other system components are configured, validated, and registered within the swarm ecosystem.

For information about how these schemas are used during runtime, see [Connection Services](#3.3). For details on the public APIs that consume these schemas, see [Public Services](#3.4).

## Architecture Overview

The schema services form a critical layer in the dependency injection system, providing validated configuration storage for all swarm components. Each service follows a consistent pattern using `ToolRegistry` from functools-kit for efficient storage and retrieval.

![Mermaid Diagram](./diagrams\15_Schema_Services_0.svg)

## Core Schema Service Pattern

All schema services implement a consistent pattern for component registration and retrieval. This pattern provides type safety, validation, and efficient storage using `ToolRegistry`.

### Common Interface

![Mermaid Diagram](./diagrams\15_Schema_Services_1.svg)

### Registry Context Management

Schema services support context-aware registry management through `SchemaContextService`. This allows for schema overrides during specific execution contexts, such as pipeline operations.

| Context State | Registry Source | Usage |
|---------------|----------------|--------|
| No Context | Private `_registry` | Normal operation |
| Schema Context Active | `context.registry.{serviceName}` | Pipeline/execution overrides |

## Individual Schema Services

### AgentSchemaService

Manages `IAgentSchemaInternal` configurations defining agent behavior, dependencies, and resources.

**Key Validation Rules:**
- `agentName` must be string
- `completion` required for non-operator agents
- `prompt` required for non-operator agents  
- Array fields (`system`, `dependsOn`, `states`, `storages`, `tools`, `mcp`) must contain unique strings

**Integration Points:**
- AgentConnectionService (agent instantiation)
- SwarmConnectionService (swarm configuration)
- ClientAgent (schema-driven execution)

### ToolSchemaService

Manages `IAgentTool` schemas defining tool execution logic and validation.

**Key Validation Rules:**
- `toolName` must be string
- `call` must be function
- `validate` must be function (if present)
- `function` must be object or function

**Default Integration:**
- Provides `CC_DEFAULT_AGENT_TOOL_VALIDATE` fallback for validation

### CompletionSchemaService

Manages `ICompletionSchema` configurations for AI model integrations.

**Key Validation Rules:**
- `completionName` must be string
- `getCompletion` must be function
- `flags` must be array of strings (if present)

### SwarmSchemaService

Manages `ISwarmSchema` configurations for agent orchestration.

**Key Validation Rules:**
- `swarmName` must be string
- `defaultAgent` must be string
- `agentList` must be array of unique strings
- `policies` must be array of unique strings (if present)

### StateSchemaService

Manages `IStateSchema` configurations for state management.

**Key Validation Rules:**
- `stateName` must be string
- `getDefaultState` must be function
- `middlewares` must be array of functions (if present)

### StorageSchemaService

Manages `IStorageSchema` configurations for data persistence and retrieval.

**Key Validation Rules:**
- `storageName` must be string
- `createIndex` must be function
- `embedding` must be string (EmbeddingName reference)

### EmbeddingSchemaService

Manages `IEmbeddingSchema` configurations for vector similarity operations.

**Key Validation Rules:**
- `embeddingName` must be string
- `calculateSimilarity` must be function
- `createEmbedding` must be function

## Schema Context System

The schema context system enables runtime schema overrides, particularly useful for pipeline operations where temporary schema modifications are needed.

![Mermaid Diagram](./diagrams\15_Schema_Services_2.svg)

## Integration with Dependency Injection

Schema services are registered in the DI container and consumed by connection services, validation services, and public APIs.

![Mermaid Diagram](./diagrams\15_Schema_Services_3.svg)

## Logging and Performance

All schema services integrate with `LoggerService` for operations logging, controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`. This provides consistent debugging capabilities across the schema layer.

**Logged Operations:**
- Schema validation (`validateShallow`)
- Registration (`register`)
- Override (`override`) 
- Retrieval (`get`)
