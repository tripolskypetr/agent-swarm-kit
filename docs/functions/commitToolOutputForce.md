---
title: docs/api-reference/function/commitToolOutputForce
group: docs
---

# commitToolOutputForce

```ts
declare function commitToolOutputForce(toolId: string, content: string, clientId: string): Promise<void>;
```

Commits the output of a tool execution to the active agent in a swarm session without checking the active agent.

This function forcefully commits the tool output to the session, bypassing the check for whether the agent is still active in the swarm session.
It performs validation on the session and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `toolId` | |
| `content` | |
| `clientId` | |
