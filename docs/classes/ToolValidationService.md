# ToolValidationService

Service for validating tool configurations within the swarm system.
Manages a map of registered tools, ensuring their uniqueness and existence during validation.
Integrates with ToolSchemaService (tool registration), AgentValidationService (validating agent tools),
ClientAgent (tool usage), and LoggerService (logging).
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

### _toolMap

```ts
_toolMap: any
```

Map of tool names to their schemas, used to track and validate tools.
Populated by addTool, queried by validate.

### addTool

```ts
addTool: (toolName: string, toolSchema: IAgentTool<Record<string, ToolValue>>) => void
```

Registers a new tool with its schema in the validation service.
Logs the operation and ensures uniqueness, supporting ToolSchemaService’s registration process.

### validate

```ts
validate: (toolName: string, source: string) => void
```

Validates if a tool name exists in the registered map, memoized by toolName for performance.
Logs the operation and checks existence, supporting AgentValidationService’s validation of agent tools.
