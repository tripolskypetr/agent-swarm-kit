---
title: docs/api-reference/interface/IPersistActiveAgentData
group: docs
---

# IPersistActiveAgentData

Defines the structure for data stored in active agent persistence.
Used by `PersistSwarmUtils` to track the currently active agent per client and swarm.

## Properties

### agentName

```ts
agentName: string
```

The name of the active agent for a given client within a swarm.
`AgentName` is a string identifier (e.g., "agent1") representing an agent instance in the swarm system,
tied to specific functionality or role within a `SwarmName`.
