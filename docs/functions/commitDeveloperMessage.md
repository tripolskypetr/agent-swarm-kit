---
title: docs/api-reference/function/commitDeveloperMessage
group: docs
---

# commitDeveloperMessage

```ts
declare function commitDeveloperMessage(content: string, clientId: string, agentName: string): Promise<void>;
```

Commits a developer-generated message to the active agent in the swarm system.
Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the message.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (message committing),
and LoggerService (logging). Complements functions like commitSystemMessage by handling developer messages
(e.g., user or developer instructions) rather than system-generated or assistant-generated responses.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content of the developer message to commit, typically related to user or developer instructions. |
| `clientId` | The ID of the client associated with the session, validated against active sessions. |
| `agentName` | The name of the agent to commit the message for, validated against registered agents. |
