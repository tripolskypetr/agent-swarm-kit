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
| `toolName` | The name of the tool. |
| `clientId` | The unique identifier of the client session. |
| `agentName` | The name of the agent to use or reference. |
