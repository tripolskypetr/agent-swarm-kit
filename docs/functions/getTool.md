---
title: docs/api-reference/function/getTool
group: docs
---

# getTool

```ts
declare function getTool(toolName: ToolName): IAgentTool<Record<string, ToolValue>>;
```

Retrieves a tool schema by its name from the swarm's tool schema service.
Logs the operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `toolName` | The name of the tool to retrieve. |
