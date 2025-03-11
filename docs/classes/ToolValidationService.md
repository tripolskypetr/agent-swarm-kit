# ToolValidationService

Service for validating tools within the agent-swarm.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### _toolMap

```ts
_toolMap: any
```

### addTool

```ts
addTool: (toolName: string, toolSchema: IAgentTool<Record<string, ToolValue>>) => void
```

Adds a new tool to the validation service.

### validate

```ts
validate: (toolName: string, source: string) => void
```

Validates if a tool exists in the validation service.
