---
title: docs/api-reference/class/PolicyPublicService
group: docs
---

# PolicyPublicService

Implements `TPolicyConnectionService`

Service class for managing public policy operations in the swarm system.
Implements TPolicyConnectionService to provide a public API for policy-related interactions, delegating to PolicyConnectionService and wrapping calls with MethodContextService for context scoping.
Integrates with PerfService (e.g., policyBans in computeClientState), ClientAgent (e.g., input/output validation in EXECUTE_FN), DocService (e.g., policy documentation via policyName), and SwarmMetaService (e.g., swarm context via swarmName).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like ban checking, validation, and client ban management.

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
Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentPublicService and DocService logging patterns.
   *

### policyConnectionService

```ts
policyConnectionService: any
```

Policy connection service instance, injected via DI, for underlying policy operations.
Provides core functionality (e.g., hasBan, validateInput) called by public methods, aligning with PerfService’s policy enforcement.
   *

### hasBan

```ts
hasBan: (swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<boolean>
```

Checks if a client is banned from a specific swarm under a given policy.
Wraps PolicyConnectionService.hasBan with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in PerfService (e.g., policyBans in computeClientState) and ClientAgent (e.g., pre-execution ban checks in EXECUTE_FN).
   *    *    *    *

### getBanMessage

```ts
getBanMessage: (swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<string>
```

Retrieves the ban message for a client in a specific swarm under a given policy.
Wraps PolicyConnectionService.getBanMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., displaying ban reasons in EXECUTE_FN) and PerfService (e.g., policyBans logging).
   *    *    *    *

### validateInput

```ts
validateInput: (incoming: string, swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<boolean>
```

Validates incoming data against a specific policy for a client in a swarm.
Wraps PolicyConnectionService.validateInput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in ClientAgent (e.g., input validation in EXECUTE_FN) and PerfService (e.g., policy enforcement in computeClientState).
   *    *    *    *    *

### validateOutput

```ts
validateOutput: (outgoing: string, swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<boolean>
```

Validates outgoing data against a specific policy for a client in a swarm.
Wraps PolicyConnectionService.validateOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., output validation in EXECUTE_FN) and DocService (e.g., documenting policy-compliant outputs).
   *    *    *    *    *

### banClient

```ts
banClient: (swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<void>
```

Bans a client from a specific swarm under a given policy.
Wraps PolicyConnectionService.banClient with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Used in PerfService (e.g., enforcing policyBans in computeClientState) and ClientAgent (e.g., restricting access).
   *    *    *    *

### unbanClient

```ts
unbanClient: (swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<void>
```

Unbans a client from a specific swarm under a given policy.
Wraps PolicyConnectionService.unbanClient with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports PerfService (e.g., reversing policyBans) and ClientAgent (e.g., restoring access).
   *    *    *    *
