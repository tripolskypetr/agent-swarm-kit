# SwarmValidationService

Service for validating swarm configurations within the swarm system.
Manages a map of registered swarms, ensuring their uniqueness, existence, valid agent lists, default agents, and policies.
Integrates with SwarmSchemaService (swarm registration), ClientSwarm (swarm operations),
AgentValidationService (agent validation), PolicyValidationService (policy validation),
SessionValidationService (session-swarm mapping), and LoggerService (logging).
Uses dependency injection for services and memoization for efficient validation checks.

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

### agentValidationService

```ts
agentValidationService: any
```

Agent validation service instance for validating agents associated with swarms.
Injected via DI, used in validate method to check swarm.agentList.

### policyValidationService

```ts
policyValidationService: any
```

Policy validation service instance for validating policies associated with swarms.
Injected via DI, used in validate method to check swarm.policies.

### _swarmMap

```ts
_swarmMap: any
```

Map of swarm names to their schemas, used to track and validate swarms.
Populated by addSwarm, queried by getAgentList, getPolicyList, and validate.

### addSwarm

```ts
addSwarm: (swarmName: string, swarmSchema: ISwarmSchema) => void
```

Registers a new swarm with its schema in the validation service.
Logs the operation and ensures uniqueness, supporting SwarmSchemaService’s registration process.

### getAgentList

```ts
getAgentList: (swarmName: string) => string[]
```

Retrieves the list of agent names associated with a given swarm.
Logs the operation and validates swarm existence, supporting ClientSwarm’s agent management.

### getPolicyList

```ts
getPolicyList: (swarmName: string) => string[]
```

Retrieves the list of policy names associated with a given swarm.
Logs the operation and validates swarm existence, supporting ClientSwarm’s policy enforcement.

### getSwarmList

```ts
getSwarmList: () => string[]
```

Retrieves the list of all registered swarm names.
Logs the operation, supporting SwarmSchemaService’s swarm enumeration.

### validate

```ts
validate: (swarmName: string, source: string) => void
```

Validates a swarm by its name and source, memoized by swarmName for performance.
Checks swarm existence, default agent inclusion, and validates all agents and policies.
Logs the operation, supporting ClientSwarm’s operational integrity.
