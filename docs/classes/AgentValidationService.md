---
title: docs/api-reference/class/AgentValidationService
group: docs
---

# AgentValidationService

Service for validating agents within the swarm system, managing agent schemas and dependencies.
Provides methods to register agents, validate their configurations, and query associated resources (storages, states, dependencies).
Integrates with AgentSchemaService (agent schema validation), SwarmSchemaService (swarm-level agent management),
ToolValidationService (tool validation), CompletionValidationService (completion validation),
StorageValidationService (storage validation), and LoggerService (logging).
Uses dependency injection for service dependencies and memoization for efficient validation checks.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance for logging validation operations and errors.
Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

### completionSchemaService

```ts
completionSchemaService: any
```

Completion schema service instance for managing completion schemas.
Injected via DI, used in validate method to check agent completions.
Provides a registry of completion schemas for the swarm.

### toolValidationService

```ts
toolValidationService: any
```

Tool validation service instance for validating tools associated with agents.
Injected via DI, used in validate method to check agent tools.

### mcpValidationService

```ts
mcpValidationService: any
```

MCP validation service instance for validating mcp associated with agents.
Injected via DI, used in validate method to check agent mcp list.

### completionValidationService

```ts
completionValidationService: any
```

Completion validation service instance for validating completion configurations of agents.
Injected via DI, used in validate method to check agent completion.

### storageValidationService

```ts
storageValidationService: any
```

Storage validation service instance for validating storages associated with agents.
Injected via DI, used in validate method to check agent storages.

### _agentMap

```ts
_agentMap: any
```

Map of agent names to their schemas, used for validation and resource queries.
Populated by addAgent, queried by validate, getStorageList, getStateList, etc.

### _agentDepsMap

```ts
_agentDepsMap: any
```

Map of agent names to their dependency lists, tracking inter-agent dependencies.
Populated by addAgent when dependsOn is present, queried by hasDependency.

### getAgentList

```ts
getAgentList: () => string[]
```

Retrieves the list of registered agent names.
Logs the operation if info-level logging is enabled, supporting SwarmSchemaService’s agent enumeration.

### getStorageList

```ts
getStorageList: (agentName: string) => string[]
```

Retrieves the list of storage names associated with a given agent.
Logs the operation and validates agent existence, supporting ClientStorage integration.

### getStateList

```ts
getStateList: (agentName: string) => string[]
```

Retrieves the list of state names associated with a given agent.
Logs the operation and validates agent existence, supporting ClientState integration.

### getMCPList

```ts
getMCPList: (agentName: string) => string[]
```

Retrieves the list of mcp names associated with a given agent.
Logs the operation and validates agent existence, supporting ClientMCP integration.

### addAgent

```ts
addAgent: (agentName: string, agentSchema: IAgentSchemaInternal) => void
```

Registers a new agent with its schema in the validation service.
Logs the operation and updates _agentMap and _agentDepsMap, supporting AgentSchemaService’s agent registration.

### hasStorage

```ts
hasStorage: ((agentName: string, storageName: string) => boolean) & IClearableMemoize<string> & IControlMemoize<string, boolean>
```

Checks if an agent has a registered storage, memoized for performance.
Logs the operation and validates agent existence, supporting ClientStorage validation.

### hasDependency

```ts
hasDependency: ((targetAgentName: string, depAgentName: string) => boolean) & IClearableMemoize<string> & IControlMemoize<string, boolean>
```

Checks if an agent has a registered dependency on another agent, memoized for performance.
Logs the operation, supporting inter-agent dependency validation within SwarmSchemaService.

### hasState

```ts
hasState: ((agentName: string, stateName: string) => boolean) & IClearableMemoize<string> & IControlMemoize<string, boolean>
```

Checks if an agent has a registered state, memoized for performance.
Logs the operation and validates agent existence, supporting ClientState validation.

### validate

```ts
validate: (agentName: string, source: string) => void
```

Validates an agent’s configuration by its name and source, memoized by agentName for performance.
Checks the agent’s existence, completion, tools, and storages, delegating to respective validation services.
Logs the operation, supporting AgentSchemaService’s validation workflow within SwarmSchemaService.
