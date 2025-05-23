---
title: docs/api-reference/function/commitSystemMessage
group: docs
---

# commitSystemMessage

```ts
declare function commitSystemMessage(content: string, clientId: string, agentName: string): Promise<void>;
```

Commits a system-generated message to the active agent in the swarm system.
Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the message.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (message committing),
and LoggerService (logging). Complements functions like commitAssistantMessage by handling system messages (e.g., configuration or control messages)
rather than assistant-generated responses.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content of the system message to commit, typically related to system state or control instructions. |
| `clientId` | The ID of the client associated with the session, validated against active sessions. |
| `agentName` | The name of the agent to commit the message for, validated against registered agents. |
