---
title: docs/api-reference/class/OutlineValidationService
group: docs
---

# OutlineValidationService

A service class for managing and validating outline schemas in the agent swarm system.
Provides methods to register and validate outline schemas, ensuring they are unique and exist before validation.
Uses dependency injection to access the logger service and memoization for efficient validation checks.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

The logger service instance for logging outline-related operations and errors.
Injected via dependency injection using the TYPES.loggerService identifier.

### completionSchemaService

```ts
completionSchemaService: any
```

Completion schema service instance for managing completion schemas.
Injected via DI, used in validate method to check outline completions.
Provides a registry of completion schemas for the swarm.

### completionValidationService

```ts
completionValidationService: any
```

Completion validation service instance for validating completion configurations of outlines.
Injected via DI, used in validate method to check outline completion.

### _outlineMap

```ts
_outlineMap: any
```

A map storing outline schemas, keyed by their unique outline names.
Used to manage registered outlines and retrieve them for validation.

### addOutline

```ts
addOutline: (outlineName: string, outlineSchema: IOutlineSchema<any, any>) => void
```

Registers a new outline schema with the given name.
Logs the addition if info logging is enabled and throws an error if the outline name already exists.

### getOutlineList

```ts
getOutlineList: () => string[]
```

Retrieves a list of all registered outline names.
Logs the retrieval operation if info logging is enabled.

### validate

```ts
validate: (outlineName: string, source: string) => void
```

Validates the existence of an outline schema for the given outline name.
Memoized to cache results based on the outline name for performance.
Logs the validation attempt if info logging is enabled and throws an error if the outline is not found.
