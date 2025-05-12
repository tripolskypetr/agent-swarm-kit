---
title: docs/api-reference/function/changeToDefaultAgent
group: docs
---

# changeToDefaultAgent

```ts
declare function changeToDefaultAgent(clientId: string): Promise<boolean>;
```

Navigates back to the default agent for a given client session in a swarm.

This function switches the active agent to the default agent defined in the swarm schema for the specified client session.
It validates the session and default agent, logs the operation if enabled, and executes the change using a TTL-limited, queued runner.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session. |
