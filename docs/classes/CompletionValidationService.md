---
title: docs/api-reference/class/CompletionValidationService
group: docs
---

# CompletionValidationService

Service for validating completion names within the swarm system.
Manages a set of registered completion names, ensuring their uniqueness and existence during validation.
Integrates with CompletionSchemaService (completion registration), AgentValidationService (agent completion validation),
ClientAgent (completion usage), and LoggerService (logging).
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

### _completionSet

```ts
_completionSet: any
```

Set of registered completion names, used to track and validate completions.
Populated by addCompletion, queried by validate.

### addCompletion

```ts
addCompletion: (completionName: string) => void
```

Registers a new completion name in the validation service.
Logs the operation and ensures uniqueness, supporting CompletionSchemaService’s registration process.

### validate

```ts
validate: (completionName: string, source: string) => void
```

Validates if a completion name exists in the registered set, memoized by completionName for performance.
Logs the operation and checks existence, supporting AgentValidationService’s validation of agent completions.
