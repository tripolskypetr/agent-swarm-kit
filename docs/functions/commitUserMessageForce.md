---
title: docs/api-reference/function/commitUserMessageForce
group: docs
---

# commitUserMessageForce

```ts
declare function commitUserMessageForce<Payload extends object = object>(content: string, mode: ExecutionMode, clientId: string, payload?: Payload): Promise<void>;
```

Commits a user message to the active agent's history in a swarm session without triggering a response and without checking the active agent.

This function forcefully commits a user message to the history of the active agent in the specified swarm session, bypassing the check for whether the agent is still active.
It performs validation on the session and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content parameter. |
| `mode` | The mode parameter. |
| `clientId` | The clientId parameter. |
| `payload` | Payload object containing the data to be processed. |
