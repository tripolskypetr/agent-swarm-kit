---
title: docs/api-reference/function/overrideTool
group: docs
---

# overrideTool

```ts
declare function overrideTool(toolSchema: TAgentTool): IAgentTool<Record<string, ToolValue>>;
```

Overrides an existing tool schema in the swarm system with a new or partial schema.
This function updates the configuration of a tool identified by its `toolName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `toolSchema` | Optional partial schema properties to update, extending `IAgentTool`. |
