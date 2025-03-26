---
title: docs/api-reference/class/PolicyValidationService
group: docs
---

# PolicyValidationService

Service for validating policies within the swarm system.
Manages a map of registered policies, ensuring their uniqueness and existence during validation.
Integrates with PolicySchemaService (policy registration), ClientPolicy (policy enforcement),
AgentValidationService (potential policy validation for agents), and LoggerService (logging).
Uses dependency injection for the logger and memoization for efficient validation checks.

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

### _policyMap

```ts
_policyMap: any
```

Map of policy names to their schemas, used to track and validate policies.
Populated by addPolicy, queried by validate.

### addPolicy

```ts
addPolicy: (policyName: string, policySchema: IPolicySchema) => void
```

Registers a new policy with its schema in the validation service.
Logs the operation and ensures uniqueness, supporting PolicySchemaService’s registration process.

### validate

```ts
validate: (policyName: string, source: string) => void
```

Validates if a policy name exists in the registered map, memoized by policyName for performance.
Logs the operation and checks existence, supporting ClientPolicy’s policy enforcement validation.
