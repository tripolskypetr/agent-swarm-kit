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


