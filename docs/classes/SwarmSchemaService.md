---
title: docs/api-reference/class/SwarmSchemaService
group: docs
---

# SwarmSchemaService

Service class for managing swarm schemas in the swarm system.
Provides a centralized registry for storing and retrieving ISwarmSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
Integrates with SwarmConnectionService (swarm configuration for ClientSwarm), AgentConnectionService (agent list instantiation), PolicySchemaService (policy references), ClientAgent (swarm-coordinated execution), SessionConnectionService (session-swarm linking), and SwarmPublicService (public swarm API).
Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
Serves as a foundational service for defining swarm configurations (e.g., agentList, defaultAgent, policies) used to orchestrate agents within the swarm ecosystem.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: LoggerService
```

Logger service instance, injected via DI, for logging swarm schema operations.
Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SwarmConnectionService and PerfService logging patterns.

### registry

```ts
registry: any
```

Registry instance for storing swarm schemas, initialized with ToolRegistry from functools-kit.
Maps SwarmName keys to ISwarmSchema values, providing efficient storage and retrieval, used in register and get methods.
Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.

### validateShallow

```ts
validateShallow: any
```

Validates a swarm schema shallowly, ensuring required fields and optional properties meet basic integrity constraints.
Checks swarmName and defaultAgent as strings, agentList as an array of unique strings (AgentName references), and policies, if present, as an array of unique strings (PolicyName references).
Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SwarmConnectionService’s configuration needs.
Supports ClientSwarm instantiation in SwarmConnectionService by ensuring schema validity before registration.

### register

```ts
register: (key: string, value: ISwarmSchema) => void
```

Registers a new swarm schema in the registry after validation.
Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (swarmName).
Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SwarmConnectionService’s swarm management.
Supports ClientAgent execution by providing validated swarm schemas to SwarmConnectionService for ClientSwarm configuration.

### get

```ts
get: (key: string) => ISwarmSchema
```

Retrieves a swarm schema from the registry by its name.
Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports SwarmConnectionService by providing swarm configuration (e.g., agentList, defaultAgent, policies) for ClientSwarm instantiation, linking to AgentConnectionService and PolicySchemaService.
