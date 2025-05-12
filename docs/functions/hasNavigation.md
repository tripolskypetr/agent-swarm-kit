---
title: docs/api-reference/function/hasNavigation
group: docs
---

# hasNavigation

```ts
declare function hasNavigation(clientId: string, agentName: AgentName): Promise<boolean>;
```

Checks if a specific agent is part of the navigation route for a given client.
Validates the agent and client session, retrieves the associated swarm, and queries the navigation route.
Logs the operation if enabled by global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client whose navigation route is being checked. |
| `agentName` | The name of the agent to check within the navigation route. |
