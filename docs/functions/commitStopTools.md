---
title: docs/api-reference/function/commitStopTools
group: docs
---

# commitStopTools

```ts
declare function commitStopTools(clientId: string, agentName: string): Promise<void>;
```

Prevents the next tool from being executed for a specific client and agent in the swarm system.
Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before stopping tool execution.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (tool execution stop),
ToolValidationService (tool context), and LoggerService (logging). Complements functions like commitFlush by controlling tool flow rather than clearing history.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The ID of the client associated with the session, validated against active sessions. |
| `agentName` | The name of the agent whose next tool execution is to be stopped, validated against registered agents. |
