---
title: docs/api-reference/function/addTool
group: docs
---

# addTool

```ts
declare function addTool<T extends any = Record<string, ToolValue>>(toolSchema: IAgentTool<T>): string;
```

Adds a new tool to the tool registry for use by agents in the swarm system.

This function registers a new tool, enabling agents within the swarm to utilize it for performing specific tasks or operations.
Tools must be registered through this function to be recognized by the swarm, though the original comment suggests an association with
`addAgent`, likely intending that tools are linked to agent capabilities. The execution is wrapped in `beginContext` to ensure it runs
outside of existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled
and returns the tool's name upon successful registration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `toolSchema` | Tool schema configuration defining the tool's name, function, and metadata. |
