---
title: docs/api-reference/function/commitUserMessage
group: docs
---

# commitUserMessage

```ts
declare function commitUserMessage<Payload extends object = object>(content: string, mode: ExecutionMode, clientId: string, agentName: string, payload?: Payload): Promise<void>;
```

Commits a user message to the active agent's history in a swarm session without triggering a response.

This function commits a user message to the history of the specified agent, ensuring the agent is still active in the swarm session.
It performs validation checks on the agent, session, and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | |
| `mode` | |
| `clientId` | |
| `agentName` | |
| `payload` | |
