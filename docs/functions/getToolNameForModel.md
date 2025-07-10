---
title: docs/api-reference/function/getToolNameForModel
group: docs
---

# getToolNameForModel

```ts
declare function getToolNameForModel(toolName: ToolName, clientId: string, agentName: AgentName): Promise<string>;
```

Resolves the model-facing name for a tool, given its name, client, and agent context.
This is the main exported function for external usage.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `toolName` | The registered tool identifier. |
| `clientId` | The client session identifier. |
| `agentName` | The agent identifier. |
