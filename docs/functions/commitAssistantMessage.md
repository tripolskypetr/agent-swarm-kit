---
title: docs/api-reference/function/commitAssistantMessage
group: docs
---

# commitAssistantMessage

```ts
declare function commitAssistantMessage(content: string, clientId: string, agentName: string): Promise<void>;
```

Commits an assistant-generated message to the active agent in the swarm system.
Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the message.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (message committing),
and LoggerService (logging). Complements functions like cancelOutput by persisting assistant messages rather than canceling output.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content to be processed or stored. |
| `clientId` | The unique identifier of the client session. |
| `agentName` | The name of the agent to use or reference. |
