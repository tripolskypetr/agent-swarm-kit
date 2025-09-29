---
title: docs/api-reference/function/cancelOutputForce
group: docs
---

# cancelOutputForce

```ts
declare function cancelOutputForce(clientId: string): Promise<void>;
```

Forcefully cancels the awaited output for a specific client by emitting an empty string, without checking the active agent.
Validates the session and swarm, then proceeds with cancellation regardless of the current agent state.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
SwarmPublicService (output cancellation), and LoggerService (logging).
Unlike cancelOutput, this function skips agent validation and active agent checks, providing a more aggressive cancellation mechanism.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | |
