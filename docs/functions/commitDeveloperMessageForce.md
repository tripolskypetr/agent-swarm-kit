---
title: docs/api-reference/function/commitDeveloperMessageForce
group: docs
---

# commitDeveloperMessageForce

```ts
declare function commitDeveloperMessageForce(content: string, clientId: string): Promise<void>;
```

Forcefully commits a developer-generated message to a session in the swarm system, without checking the active agent.
Validates the session and swarm, then proceeds with committing the message regardless of the current agent state.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
SessionPublicService (message committing), and LoggerService (logging).
Unlike commitDeveloperMessage, this function skips agent validation and active agent checks, providing a more aggressive commit mechanism,
analogous to commitAssistantMessageForce vs. commitAssistantMessage.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content of the developer message to commit, typically related to developer actions or instructions. |
| `clientId` | The ID of the client associated with the session, validated against active sessions. |
