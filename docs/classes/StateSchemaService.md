---
title: docs/api-reference/class/StateSchemaService
group: docs
---

# StateSchemaService

Service class for managing state schemas in the swarm system.
Provides a centralized registry for storing and retrieving IStateSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
Integrates with StateConnectionService and SharedStateConnectionService (state configuration for ClientState), ClientAgent (state usage in execution), AgentSchemaService (state references in agent schemas), and StatePublicService (public state API).
Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
Serves as a foundational service for defining state configurations (e.g., getState function, middlewares) used by client-specific and shared states within the swarm ecosystem.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

Logger service instance, injected via DI, for logging state schema operations.
Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StateConnectionService and PerfService logging patterns.

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

Registry instance for storing state schemas, initialized with ToolRegistry from functools-kit.
Maps StateName keys to IStateSchema values, providing efficient storage and retrieval, used in register and get methods.
Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.

### validateShallow

```ts
validateShallow: any
```

Validates a state schema shallowly, ensuring required fields and optional properties meet basic integrity constraints.
Checks stateName as a string and getState as a function (required for state retrieval), and ensures middlewares, if present, is an array of functions.
Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StateConnectionService’s configuration needs.
Supports ClientState instantiation in StateConnectionService and SharedStateConnectionService by ensuring schema validity before registration.

### register

```ts
register: (key: string, value: IStateSchema<any>) => void
```

Registers a new state schema in the registry after validation.
Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (stateName).
Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StateConnectionService’s state management.
Supports ClientAgent execution by providing validated state schemas to StateConnectionService and SharedStateConnectionService for ClientState configuration.

### override

```ts
override: (key: string, value: Partial<IStateSchema<any>>) => IStateSchema<any>
```

Overrides an existing state schema in the registry with a new schema.
Replaces the schema associated with the provided key (stateName) in the ToolRegistry.
Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports dynamic updates to state schemas for StateConnectionService and SharedStateConnectionService.

### get

```ts
get: (key: string) => IStateSchema<any>
```

Retrieves a state schema from the registry by its name.
Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports StateConnectionService and SharedStateConnectionService by providing state configuration (e.g., getState, middlewares) for ClientState instantiation, referenced in AgentSchemaService schemas.
