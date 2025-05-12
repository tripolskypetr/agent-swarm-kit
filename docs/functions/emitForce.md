---
title: docs/api-reference/function/emitForce
group: docs
---

# emitForce

```ts
declare function emitForce(content: string, clientId: string): Promise<void>;
```

Emits a string as model output without executing an incoming message or checking the active agent.

This function directly emits a provided string as output from the swarm session, bypassing message execution and agent activity checks.
It is designed exclusively for sessions established via `makeConnection`, ensuring compatibility with its connection model.
The execution is wrapped in `beginContext` for a clean environment, validates the session and swarm, and throws an error if the session mode
is not "makeConnection". The operation is logged if enabled, and resolves when the content is successfully emitted.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content to be emitted as the model output. |
| `clientId` | The unique identifier of the client session emitting the content. |
