---
title: docs/api-reference/function/commitToolOutput
group: docs
---

# commitToolOutput

```ts
declare function commitToolOutput(toolId: string, content: string, clientId: string, agentName: AgentName): Promise<void>;
```

Commits the output of a tool execution to the active agent in a swarm session.

This function ensures that the tool output is committed only if the specified agent is still the active agent in the swarm session.
It performs validation checks on the agent, session, and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `toolId` | The unique identifier of the tool whose output is being committed. |
| `content` | The content or result of the tool execution to be committed. |
| `clientId` | The unique identifier of the client session associated with the operation. |
| `agentName` | The name of the agent committing the tool output. |
