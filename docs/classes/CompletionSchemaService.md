# CompletionSchemaService

Service class for managing completion schemas in the swarm system.
Provides a centralized registry for storing and retrieving ICompletionSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
Integrates with AgentSchemaService (completions referenced in agent schemas), ClientAgent (execution using completion functions), AgentConnectionService (agent instantiation with completions), and SwarmConnectionService (swarm-level agent execution).
Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
Serves as a foundational service for defining completion logic (e.g., getCompletion functions) used by agents within the swarm ecosystem.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

Logger service instance, injected via DI, for logging completion schema operations.
Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentSchemaService and PerfService logging patterns.

### registry

```ts
registry: any
```

Registry instance for storing completion schemas, initialized with ToolRegistry from functools-kit.
Maps CompletionName keys to ICompletionSchema values, providing efficient storage and retrieval, used in register and get methods.
Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.

### validateShallow

```ts
validateShallow: any
```

Validates a completion schema shallowly, ensuring required fields meet basic integrity constraints.
Checks completionName as a string and getCompletion as a function, critical for agent execution in ClientAgent.
Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s schema-driven needs.
Supports ClientAgent execution by ensuring completion schema validity before registration.

### register

```ts
register: (key: string, value: ICompletionSchema) => void
```

Registers a new completion schema in the registry after validation.
Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (completionName).
Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentSchemaService’s completion references.
Supports ClientAgent execution by providing validated completion schemas to AgentConnectionService and SwarmConnectionService.

### get

```ts
get: (key: string) => ICompletionSchema
```

Retrieves a completion schema from the registry by its name.
Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports AgentConnectionService’s agent instantiation by providing completion logic (getCompletion) referenced in AgentSchemaService schemas, and ClientAgent’s execution flow.
