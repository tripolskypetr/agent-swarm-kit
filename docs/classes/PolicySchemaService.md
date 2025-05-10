---
title: docs/api-reference/class/PolicySchemaService
group: docs
---

# PolicySchemaService

Service class for managing policy schemas in the swarm system.
Provides a centralized registry for storing and retrieving IPolicySchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
Integrates with PolicyConnectionService (policy enforcement via getBannedClients), ClientAgent (policy application during execution), SessionConnectionService (session-level policy checks), and PolicyPublicService (public policy API).
Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
Serves as a foundational service for defining policy logic (e.g., getBannedClients function) to manage access control and restrictions within the swarm ecosystem.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

Logger service instance, injected via DI, for logging policy schema operations.
Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with PolicyConnectionService and PerfService logging patterns.

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

Registry instance for storing policy schemas, initialized with ToolRegistry from functools-kit.
Maps PolicyName keys to IPolicySchema values, providing efficient storage and retrieval, used in register and get methods.
Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.

### validateShallow

```ts
validateShallow: any
```

Validates a policy schema shallowly, ensuring required fields meet basic integrity constraints.
Checks policyName as a string and getBannedClients as a function, critical for policy enforcement in PolicyConnectionService.
Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with PolicyConnectionService’s needs.
Supports ClientAgent and SessionConnectionService by ensuring policy schema validity before registration.

### register

```ts
register: (key: string, value: IPolicySchema) => void
```

Registers a new policy schema in the registry after validation.
Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (policyName).
Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with PolicyConnectionService’s policy enforcement.
Supports ClientAgent execution and SessionConnectionService by providing validated policy schemas for access control.

### override

```ts
override: (key: string, value: Partial<IPolicySchema>) => IPolicySchema
```

Overrides an existing policy schema in the registry with a new one.
Replaces the schema associated with the provided key (policyName) in the ToolRegistry.
Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports dynamic updates to policy schemas, ensuring the latest logic is applied in ClientAgent execution and SessionConnectionService.

### get

```ts
get: (key: string) => IPolicySchema
```

Retrieves a policy schema from the registry by its name.
Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports PolicyConnectionService’s getBannedClients method by providing policy logic, used in ClientAgent execution and SessionConnectionService session management.
