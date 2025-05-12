---
title: docs/api-reference/function/changeToPrevAgent
group: docs
---

# changeToPrevAgent

```ts
declare function changeToPrevAgent(clientId: string): Promise<boolean>;
```

Navigates back to the previous or default agent for a given client session in a swarm.

This function switches the active agent to the previous agent in the navigation stack, or the default agent if no previous agent exists,
as determined by the `navigationPop` method. It validates the session and agent, logs the operation if enabled, and executes the change using a TTL-limited, queued runner.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session. |
