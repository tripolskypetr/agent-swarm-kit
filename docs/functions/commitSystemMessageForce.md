---
title: docs/api-reference/function/commitSystemMessageForce
group: docs
---

# commitSystemMessageForce

```ts
declare function commitSystemMessageForce(content: string, clientId: string): Promise<void>;
```

Forcefully commits a system-generated message to a session in the swarm system, without checking the active agent.
Validates the session and swarm, then proceeds with committing the message regardless of the current agent state.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
SessionPublicService (message committing), and LoggerService (logging).
Unlike commitSystemMessage, this function skips agent validation and active agent checks, providing a more aggressive commit mechanism,
analogous to commitAssistantMessageForce vs. commitAssistantMessage.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content of the system message to commit, typically related to system state or control instructions. |
| `clientId` | The ID of the client associated with the session, validated against active sessions. |
