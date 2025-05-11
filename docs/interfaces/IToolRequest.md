---
title: docs/api-reference/interface/IToolRequest
group: docs
---

# IToolRequest

Interface representing a request to invoke a specific tool within the swarm system.
Encapsulates the tool name and its associated parameters, used to trigger tool execution.
Typically constructed by agents or models to define the desired tool action and its input arguments.

## Properties

### toolName

```ts
toolName: string
```

The name of the tool to be invoked.
Must match the name of a defined tool in the system (e.g., ITool.function.name).
Example: "search" for invoking a search tool.

### params

```ts
params: Record<string, unknown>
```

A key-value map of parameters to be passed to the tool.
Defines the input arguments required for the tool's execution, validated against the tool's parameter schema (e.g., ITool.function.parameters).
Example: `{ query: "example" }` for a search tool.
