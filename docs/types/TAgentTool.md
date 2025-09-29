---
title: docs/api-reference/type/TAgentTool
group: docs
---

# TAgentTool

```ts
type TAgentTool<T extends any = Record<string, ToolValue>> = {
    toolName: IAgentTool<T>["toolName"];
} & Partial<IAgentTool<T>>;
```

Type representing a partial agent tool schema with required toolName.
Used for overriding existing tool configurations with selective updates.
Combines required tool name with optional tool properties.
