---
title: docs/api-reference/function/commitStopToolsForce
group: docs
---

# commitStopToolsForce

```ts
declare function commitStopToolsForce(clientId: string): Promise<void>;
```

Forcefully prevents the next tool from being executed for a specific client in the swarm system, without checking the active agent.
Validates the session and swarm, then proceeds with stopping tool execution regardless of the current agent state.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
SessionPublicService (tool execution stop), ToolValidationService (tool context), and LoggerService (logging).
Unlike commitStopTools, this function skips agent validation and active agent checks, providing a more aggressive stop mechanism,
analogous to commitFlushForce vs. commitFlush.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The ID of the client associated with the session, validated against active sessions. |
