---
title: docs/api-reference/function/commitFlushForce
group: docs
---

# commitFlushForce

```ts
declare function commitFlushForce(clientId: string): Promise<void>;
```

Forcefully commits a flush of agent history for a specific client in the swarm system, without checking the active agent.
Validates the session and swarm, then proceeds with flushing the history regardless of the current agent state.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
SessionPublicService (history flush), and LoggerService (logging).
Unlike commitFlush, this function skips agent validation and active agent checks, providing a more aggressive flush mechanism,
analogous to commitAssistantMessageForce vs. commitAssistantMessage.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The ID of the client associated with the session, validated against active sessions. |
