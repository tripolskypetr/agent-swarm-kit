---
title: docs/api-reference/function/getSessionMode
group: docs
---

# getSessionMode

```ts
declare function getSessionMode(clientId: string): Promise<SessionMode>;
```

Retrieves the session mode for a given client session in a swarm.

This function returns the current mode of the specified client session, which can be one of `"session"`, `"makeConnection"`, or `"complete"`.
It validates the client session and associated swarm, logs the operation if enabled, and fetches the session mode using the session validation service.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session whose mode is being retrieved. |
