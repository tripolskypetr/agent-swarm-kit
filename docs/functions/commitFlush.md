---
title: docs/api-reference/function/commitFlush
group: docs
---

# commitFlush

```ts
declare function commitFlush(clientId: string, agentName: string): Promise<void>;
```

Commits a flush of agent history for a specific client and agent in the swarm system.
Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before flushing the history.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (history flush),
and LoggerService (logging). Complements functions like commitAssistantMessage by clearing agent history rather than adding messages.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The ID of the client associated with the session, validated against active sessions. |
| `agentName` | The name of the agent whose history is to be flushed, validated against registered agents. |
