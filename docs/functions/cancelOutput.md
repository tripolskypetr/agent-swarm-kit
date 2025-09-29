---
title: docs/api-reference/function/cancelOutput
group: docs
---

# cancelOutput

```ts
declare function cancelOutput(clientId: string, agentName: string): Promise<void>;
```

Cancels the awaited output for a specific client and agent by emitting an empty string.
Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before cancellation.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
SwarmValidationService (swarm validation), and SwarmPublicService (agent retrieval and output cancellation).

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | |
| `agentName` | |
