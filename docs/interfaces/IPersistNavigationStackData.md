---
title: docs/api-reference/interface/IPersistNavigationStackData
group: docs
---

# IPersistNavigationStackData

Defines the structure for data stored in navigation stack persistence.
Used by `PersistSwarmUtils` to maintain a stack of agent names for navigation history.

## Properties

### agentStack

```ts
agentStack: string[]
```

The stack of agent names representing navigation history for a client within a swarm.
`AgentName` is a string identifier (e.g., "agent1", "agent2") for agents in the swarm system,
tracking the sequence of active agents for a `SessionId` within a `SwarmName`.
