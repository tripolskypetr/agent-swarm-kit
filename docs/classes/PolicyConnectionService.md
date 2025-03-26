---
title: docs/api-reference/class/PolicyConnectionService
group: docs
---

# PolicyConnectionService

Implements `IPolicy`

Service class for managing policy connections and operations in the swarm system.
Implements IPolicy to provide an interface for policy instance management, ban status checks, input/output validation, and ban management, scoped to policyName, clientId, and swarmName.
Integrates with ClientAgent (policy enforcement in EXECUTE_FN), SessionPublicService (session-level policy enforcement), PolicyPublicService (public policy API), SwarmPublicService (swarm context), and PerfService (tracking via BusService).
Uses memoization via functools-kit’s memoize to cache ClientPolicy instances by policyName, ensuring efficient reuse across calls.
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with PolicySchemaService for policy configuration and BusService for event emission.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging policy operations.
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with PolicyPublicService and PerfService logging patterns.

### busService

```ts
busService: any
```

Bus service instance, injected via DI, for emitting policy-related events.
Passed to ClientPolicy for event propagation (e.g., ban updates), aligning with BusService’s event system in SessionPublicService.

### methodContextService

```ts
methodContextService: any
```

Method context service instance, injected via DI, for accessing execution context.
Used to retrieve policyName in method calls, integrating with MethodContextService’s scoping in PolicyPublicService.

### policySchemaService

```ts
policySchemaService: any
```

Policy schema service instance, injected via DI, for retrieving policy configurations.
Provides policy details (e.g., autoBan, schema) in getPolicy, aligning with DocService’s policy documentation.

### getPolicy

```ts
getPolicy: ((policyName: string) => ClientPolicy) & IClearableMemoize<string> & IControlMemoize<string, ClientPolicy>
```

Retrieves or creates a memoized ClientPolicy instance for a given policy name.
Uses functools-kit’s memoize to cache instances by policyName, ensuring efficient reuse across calls.
Configures the policy with schema data from PolicySchemaService, defaulting autoBan to GLOBAL_CONFIG.CC_AUTOBAN_ENABLED_BY_DEFAULT if not specified.
Supports ClientAgent (policy enforcement), SessionPublicService (session policies), and PolicyPublicService (public API).

### hasBan

```ts
hasBan: (clientId: string, swarmName: string) => Promise<boolean>
```

Checks if a client has a ban flag in a specific swarm.
Delegates to ClientPolicy.hasBan, using context from MethodContextService to identify the policy, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors PolicyPublicService’s hasBan, supporting ClientAgent’s execution restrictions and SessionPublicService’s policy enforcement.

### getBanMessage

```ts
getBanMessage: (clientId: string, swarmName: string) => Promise<string>
```

Retrieves the ban message for a client in a specific swarm.
Delegates to ClientPolicy.getBanMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors PolicyPublicService’s getBanMessage, supporting ClientAgent’s ban feedback and SessionPublicService’s policy reporting.

### validateInput

```ts
validateInput: (incoming: string, clientId: string, swarmName: string) => Promise<boolean>
```

Validates incoming input for a client in a specific swarm against the policy.
Delegates to ClientPolicy.validateInput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors PolicyPublicService’s validateInput, supporting ClientAgent’s input validation (e.g., in EXECUTE_FN) and SessionPublicService’s policy checks.

### validateOutput

```ts
validateOutput: (outgoing: string, clientId: string, swarmName: string) => Promise<boolean>
```

Validates outgoing output for a client in a specific swarm against the policy.
Delegates to ClientPolicy.validateOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors PolicyPublicService’s validateOutput, supporting ClientAgent’s output validation (e.g., in EXECUTE_FN) and SessionPublicService’s policy checks.

### banClient

```ts
banClient: (clientId: string, swarmName: string) => Promise<void>
```

Bans a client from a specific swarm based on the policy.
Delegates to ClientPolicy.banClient, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors PolicyPublicService’s banClient, supporting ClientAgent’s ban enforcement and SessionPublicService’s policy actions.

### unbanClient

```ts
unbanClient: (clientId: string, swarmName: string) => Promise<void>
```

Unbans a client from a specific swarm based on the policy.
Delegates to ClientPolicy.unbanClient, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Mirrors PolicyPublicService’s unbanClient, supporting ClientAgent’s ban reversal and SessionPublicService’s policy actions.
